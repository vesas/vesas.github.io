import Phaser from '../phaser.js';
import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT } from '../constants.js';
import { TileType } from '../world/TileTypes.js';
import { generateWorld } from '../world/WorldGen.js';
import Player from '../entities/Player.js';
import Candy from '../entities/Candy.js';
import NPC from '../entities/NPC.js';
import HUD from '../ui/HUD.js';

const TILE_COLORS = {
  [TileType.PLAINS]:         0x4a7c3f,
  [TileType.FIELDS]:         0xd4a017,
  [TileType.MOUNTAIN_BASE]:  0x7a5c3a,
  [TileType.MOUNTAIN_PEAK]:  0x5a3e28,
  [TileType.CANDY_MOUNTAIN]: 0xff69b4,
};

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
  }

  init(data) {
    this.seed = (data && data.seed) ? data.seed : 1;
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

    // Physics + camera bounds
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // --- Terrain: merge horizontal runs of same tile type ---
    const gfx = this.add.graphics();
    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      let tx = 0;
      while (tx < MAP_WIDTH) {
        const tileType = worldData.tileData[ty * MAP_WIDTH + tx];
        let run = 1;
        while (
          tx + run < MAP_WIDTH &&
          worldData.tileData[ty * MAP_WIDTH + tx + run] === tileType
        ) run++;
        gfx.fillStyle(TILE_COLORS[tileType]);
        gfx.fillRect(tx * TILE_SIZE, ty * TILE_SIZE, run * TILE_SIZE, TILE_SIZE);
        tx += run;
      }
    }

    // --- Mountain peak walls: invisible rectangles with static bodies ---
    const walls = [];
    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      for (let tx = 0; tx < MAP_WIDTH; tx++) {
        if (worldData.tileData[ty * MAP_WIDTH + tx] === TileType.MOUNTAIN_PEAK) {
          const wx = tx * TILE_SIZE + TILE_SIZE / 2;
          const wy = ty * TILE_SIZE + TILE_SIZE / 2;
          const rect = this.add.rectangle(wx, wy, TILE_SIZE, TILE_SIZE);
          rect.setAlpha(0);
          this.physics.add.existing(rect, true);
          walls.push(rect);
        }
      }
    }

    // --- Player (world center) ---
    const cx = (MAP_WIDTH / 2) * TILE_SIZE + TILE_SIZE / 2;
    const cy = (MAP_HEIGHT / 2) * TILE_SIZE + TILE_SIZE / 2;
    this.player = new Player(this, cx, cy);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // --- Candy ---
    this.candyGroup = this.physics.add.staticGroup();
    for (const pos of worldData.candyPositions) {
      const candy = new Candy(this, pos.x, pos.y);
      this.candyGroup.add(candy, false); // false = already added to scene in constructor
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

    // Colliders
    if (walls.length > 0) {
      this.physics.add.collider(this.player, walls);
      this.physics.add.collider(this.npcGroup, walls);
    }
    this.physics.add.collider(this.npcGroup, this.npcGroup);

    // HUD
    this.hud = new HUD(this);
  }

  update(time, delta) {
    if (this.player) this.player.update();
    if (this.candyGroup) {
      for (const c of this.candyGroup.getChildren()) c.update(time);
    }
    if (this.npcGroup) {
      for (const n of this.npcGroup.getChildren()) n.update(time, delta);
    }
  }
}
