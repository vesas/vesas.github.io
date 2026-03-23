import Phaser from '../phaser.js';
import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT } from '../constants.js';
import { TileType, TILE_TEXTURE_KEYS } from '../world/TileTypes.js';
import { generateWorld } from '../world/WorldGen.js';
import Player from '../entities/Player.js';
import Candy from '../entities/Candy.js';
import NPC from '../entities/NPC.js';
import Animal from '../entities/Animal.js';
import HUD from '../ui/HUD.js';


export default class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
  }

  init(data) {
    this.seed = (data && data.seed) ? data.seed : 1;
    this.initCandyCount = (data && data.candyCount) ? data.candyCount : 0;
    this.initMeatCount = (data && data.meatCount) ? data.meatCount : 0;
    this.fromHouse = !!(data && data.fromHouse);
  }

  create() {
    try {
      this._build();
    } catch (e) {
      console.error('WorldScene error:', e);
      this.add.rectangle(400, 300, 780, 300, 0x000000, 0.85).setScrollFactor(0).setDepth(100);
      this.add.text(400, 300,
        'Error in WorldScene:\n' + e.message + '\n\n' + (e.stack || '').slice(0, 300),
        { fontSize: '13px', color: '#ff4444', wordWrap: { width: 750 } }
      ).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    }
  }

  _build() {
    const worldData = generateWorld(this.seed);
    this._transitioning = false;

    // Physics + camera bounds
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // --- Terrain: bake all tiles into a single RenderTexture ---
    const rt = this.add.renderTexture(0, 0, WORLD_WIDTH, WORLD_HEIGHT).setOrigin(0, 0);
    rt.beginDraw();
    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      for (let tx = 0; tx < MAP_WIDTH; tx++) {
        const tileType = worldData.tileData[ty * MAP_WIDTH + tx];
        rt.batchDrawFrame(TILE_TEXTURE_KEYS[tileType], undefined, tx * TILE_SIZE, ty * TILE_SIZE);
      }
    }
    rt.endDraw();

    // --- Mountain peak + rocks walls: invisible rectangles with static bodies ---
    const walls = [];
    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      for (let tx = 0; tx < MAP_WIDTH; tx++) {
        const t = worldData.tileData[ty * MAP_WIDTH + tx];
        if (t === TileType.MOUNTAIN_PEAK || t === TileType.ROCKS) {
          const wx = tx * TILE_SIZE + TILE_SIZE / 2;
          const wy = ty * TILE_SIZE + TILE_SIZE / 2;
          const rect = this.add.rectangle(wx, wy, TILE_SIZE, TILE_SIZE);
          rect.setAlpha(0);
          this.physics.add.existing(rect, true);
          walls.push(rect);
        }
      }
    }

    // World center (mountain peak)
    const cx = (MAP_WIDTH / 2) * TILE_SIZE + TILE_SIZE / 2;
    const cy = (MAP_HEIGHT / 2) * TILE_SIZE + TILE_SIZE / 2;

    // --- House at mountain center ---
    this.add.image(cx, cy, 'house').setDepth(2);
    // Collision body covers roof + N/E/W walls (top 44 of 64px), leaving door gap open at south
    const houseBody = this.add.rectangle(cx, cy - 10, 64, 44).setAlpha(0);
    this.physics.add.existing(houseBody, true);

    // --- Player ---
    // Spawn below house door: further out on first load, right at door when returning
    const spawnY = this.fromHouse ? cy + 70 : cy + 80;
    this.player = new Player(this, cx, spawnY);
    this.player.setDepth(3);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    if (this.initCandyCount > 0) {
      this.player.candyCount = this.initCandyCount;
    }
    if (this.initMeatCount > 0) {
      this.player.meatCount = this.initMeatCount;
    }

    this.physics.add.collider(this.player, houseBody);

    // Door trigger: overlaps player when they walk into the door opening
    const doorZone = this.add.zone(cx, cy + 22, 24, 12);
    this.physics.add.existing(doorZone, true);
    this.physics.add.overlap(this.player, doorZone, () => this._enterHouse());

    // --- Candy ---
    this.candyGroup = this.physics.add.staticGroup();
    for (const pos of worldData.candyPositions) {
      const candy = new Candy(this, pos.x, pos.y);
      this.candyGroup.add(candy, false);
    }

    this.physics.add.overlap(
      this.player,
      this.candyGroup,
      (_player, candy) => {
        candy.collect();
        this.player.collectCandy();
      }
    );

    // --- NPCs ---
    this.npcGroup = this.physics.add.group();
    for (const pos of worldData.villagerSpawns) {
      this.npcGroup.add(new NPC(this, pos.x, pos.y, 'villager'));
    }
    for (const pos of worldData.thiefSpawns) {
      this.npcGroup.add(new NPC(this, pos.x, pos.y, 'thief', this.candyGroup));
    }

    // --- Animals ---
    this.animalGroup = this.physics.add.group();
    for (const pos of worldData.animalSpawns) {
      this.animalGroup.add(new Animal(this, pos.x, pos.y));
    }
    this.physics.add.overlap(
      this.player,
      this.animalGroup,
      (_player, animal) => {
        if (animal._caught) return;
        animal.catch();
        this.player.catchAnimal();
      }
    );

    // Colliders
    if (walls.length > 0) {
      this.physics.add.collider(this.player, walls);
      this.physics.add.collider(this.npcGroup, walls);
      this.physics.add.collider(this.animalGroup, walls);
    }
    this.physics.add.collider(this.npcGroup, this.npcGroup);
    this.physics.add.collider(this.npcGroup, houseBody);

    // HUD
    this.hud = new HUD(this);
    if (this.initCandyCount > 0) {
      this.events.emit('candyCollected', this.initCandyCount);
    }
    if (this.initMeatCount > 0) {
      this.events.emit('animalCaught', this.initMeatCount);
    }
  }

  _enterHouse() {
    if (this._transitioning) return;
    this._transitioning = true;
    this.scene.start('HouseScene', { seed: this.seed, candyCount: this.player.candyCount, meatCount: this.player.meatCount });
  }

  update(time, delta) {
    if (this.player) this.player.update();
    if (this.candyGroup) {
      for (const c of this.candyGroup.getChildren()) c.update(time);
    }
    if (this.npcGroup) {
      for (const n of this.npcGroup.getChildren()) n.update(time, delta);
    }
    if (this.animalGroup) {
      for (const a of this.animalGroup.getChildren()) a.update(time, delta);
    }
  }
}
