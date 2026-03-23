import Phaser from '../phaser.js';
import Player from '../entities/Player.js';
import HUD from '../ui/HUD.js';

// Room bounds (within 800×600 canvas)
const ROOM_L = 80;
const ROOM_T = 60;
const ROOM_R = 720;
const ROOM_B = 540;
const ROOM_W = ROOM_R - ROOM_L; // 640
const ROOM_H = ROOM_B - ROOM_T; // 480

// Door gap in bottom wall, centered
const DOOR_W = 48;
const DOOR_L = 400 - DOOR_W / 2; // 376
const DOOR_R = 400 + DOOR_W / 2; // 424

export default class HouseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HouseScene' });
  }

  init(data) {
    this.seed = data?.seed ?? 1;
    this.initCandyCount = data?.candyCount ?? 0;
    this.initMeatCount = data?.meatCount ?? 0;
  }

  create() {
    this.physics.world.setBounds(0, 0, 800, 600);
    this.cameras.main.setBounds(0, 0, 800, 600);

    // --- Draw room ---
    const bg = this.add.graphics();

    // Dark surround
    bg.fillStyle(0x0a0508);
    bg.fillRect(0, 0, 800, 600);

    // Wood floor
    bg.fillStyle(0xc8a87e);
    bg.fillRect(ROOM_L, ROOM_T, ROOM_W, ROOM_H);

    // Floor planks (decorative lines)
    bg.lineStyle(1, 0xb8946e, 0.6);
    for (let y = ROOM_T + 32; y < ROOM_B; y += 32) {
      bg.lineBetween(ROOM_L, y, ROOM_R, y);
    }

    // Walls (thick border)
    bg.fillStyle(0x5a3010);
    bg.fillRect(ROOM_L, ROOM_T, ROOM_W, 14);              // top
    bg.fillRect(ROOM_L, ROOM_T, 14, ROOM_H);              // left
    bg.fillRect(ROOM_R - 14, ROOM_T, 14, ROOM_H);         // right
    bg.fillRect(ROOM_L, ROOM_B - 14, DOOR_L - ROOM_L, 14); // bottom-left
    bg.fillRect(DOOR_R, ROOM_B - 14, ROOM_R - DOOR_R, 14); // bottom-right

    // Doorstep
    bg.fillStyle(0xa07040);
    bg.fillRect(DOOR_L, ROOM_B - 24, DOOR_W, 24);

    // --- Inner walls ---
    bg.fillStyle(0x5a3010);
    // Horizontal wall at y=262, three segments around two doorways
    bg.fillRect(94,  262, 129, 14);   // left  (x 94→223)
    bg.fillRect(271, 262, 258, 14);   // middle (x 271→529)
    bg.fillRect(577, 262, 129, 14);   // right  (x 577→706)
    // Vertical wall at x=393, y=74→262 (no doorway)
    bg.fillRect(393, 74, 14, 188);
    // Doorsteps inside the two doorways
    bg.fillStyle(0xa07040);
    bg.fillRect(223, 262, 48, 14);    // Door A step (Kitchen doorway)
    bg.fillRect(529, 262, 48, 14);    // Door B step (Storage doorway)

    // --- Oven (against north wall, left of center) ---
    // Top-down view: body, stovetop surface, 4 heating burners, front panel
    const OX = 248, OY = 76, OW = 64, OH = 40;
    // Body
    bg.fillStyle(0x555566);
    bg.fillRect(OX, OY, OW, OH);
    // Front panel (south face, slightly darker)
    bg.fillStyle(0x333344);
    bg.fillRect(OX, OY + OH - 8, OW, 8);
    // Stovetop surface
    bg.fillStyle(0x888899);
    bg.fillRect(OX + 4, OY + 4, OW - 8, OH - 16);
    // Burners — 4 heating elements with orange glow centers
    const burners = [
      [OX + 16, OY + 14],
      [OX + 48, OY + 14],
      [OX + 16, OY + 28],
      [OX + 48, OY + 28],
    ];
    for (const [bx, by] of burners) {
      bg.fillStyle(0x222222);
      bg.fillCircle(bx, by, 7);
      bg.fillStyle(0xcc3300);
      bg.fillCircle(bx, by, 4);
      bg.fillStyle(0xff6622);
      bg.fillCircle(bx, by, 2);
    }
    // Handle bar
    bg.fillStyle(0x111122);
    bg.fillRect(OX + 10, OY + OH - 4, OW - 20, 3);
    // Label
    this.add.text(OX + OW / 2, OY + OH + 6, 'oven', {
      fontSize: '9px', fontFamily: 'Arial', color: '#888899',
    }).setOrigin(0.5);

    // --- Bed (Main Hall, against west wall) ---
    const BX = 100, BY = 298, BW = 54, BH = 38;
    // Frame (dark wood)
    bg.fillStyle(0x6b3a1f);
    bg.fillRect(BX, BY, BW, BH);
    // Mattress (cream)
    bg.fillStyle(0xe8d8c0);
    bg.fillRect(BX + 3, BY + 3, BW - 6, BH - 6);
    // Blanket/cover (top 60% of mattress, light blue)
    bg.fillStyle(0x8899cc);
    bg.fillRect(BX + 3, BY + 3, BW - 6, Math.floor((BH - 6) * 0.6));
    // Pillow (near-white, at north end, on top of blanket)
    bg.fillStyle(0xf0f0e0);
    bg.fillRect(BX + 8, BY + 4, BW - 16, 10);

    // --- Boxes (NE Storage room, 2×2 cluster) ---
    const storageBoxes = [
      [452, 84], [482, 84],
      [452, 114], [482, 114],
    ];
    for (const [bx, by] of storageBoxes) {
      // Cardboard body
      bg.fillStyle(0xc8902a);
      bg.fillRect(bx, by, 26, 26);
      // Lighter top highlight
      bg.fillStyle(0xd4a848);
      bg.fillRect(bx + 2, by + 2, 22, 10);
      // Fold lines (X on top of box)
      bg.lineStyle(1, 0x8b5a10, 0.8);
      bg.lineBetween(bx + 2, by + 2, bx + 24, by + 12);
      bg.lineBetween(bx + 24, by + 2, bx + 2, by + 12);
    }

    // --- Sub-room labels ---
    this.add.text(240, 161, 'Kitchen', {
      fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', color: '#7a5030',
    }).setOrigin(0.5);
    this.add.text(560, 161, 'Storage', {
      fontSize: '13px', fontFamily: 'Arial', fontStyle: 'bold', color: '#7a5030',
    }).setOrigin(0.5);

    // --- Room label ---
    this.add.text(400, 401, 'Mountain House', {
      fontSize: '18px', fontFamily: 'Arial', fontStyle: 'bold', color: '#5a3010',
    }).setOrigin(0.5);

    // --- Exit label ---
    this.add.text(400, ROOM_B + 12, '▼ EXIT', {
      fontSize: '11px', fontFamily: 'Arial', color: '#cccccc',
    }).setOrigin(0.5);

    // --- Physics walls (invisible) ---
    const makeWall = (x, y, w, h) => {
      const r = this.add.rectangle(x, y, w, h).setAlpha(0);
      this.physics.add.existing(r, true);
      return r;
    };
    const walls = [
      makeWall(400,           ROOM_T - 4,       ROOM_W,            8),  // top
      makeWall(ROOM_L - 4,   300,               8,                 ROOM_H), // left
      makeWall(ROOM_R + 4,   300,               8,                 ROOM_H), // right
      makeWall((ROOM_L + DOOR_L) / 2, ROOM_B + 4, DOOR_L - ROOM_L, 8), // bottom-left
      makeWall((DOOR_R + ROOM_R) / 2, ROOM_B + 4, ROOM_R - DOOR_R, 8), // bottom-right
      makeWall(OX + OW / 2, OY + OH / 2, OW, OH), // oven
      // Inner horizontal wall — three segments
      makeWall(158.5, 269, 129, 14), // h-wall left  (x 94→223)
      makeWall(400,   269, 258, 14), // h-wall middle (x 271→529)
      makeWall(641.5, 269, 129, 14), // h-wall right  (x 577→706)
      // Inner vertical wall
      makeWall(400, 168, 14, 188),   // v-wall (x 393→407, y 74→262)
      makeWall(BX + BW / 2, BY + BH / 2, BW, BH), // bed
      makeWall(465, 97,  26, 26), // box top-left
      makeWall(495, 97,  26, 26), // box top-right
      makeWall(465, 127, 26, 26), // box bottom-left
      makeWall(495, 127, 26, 26), // box bottom-right
    ];

    // --- Player spawns at door ---
    this.player = new Player(this, 400, ROOM_B - 40);
    this.player.candyCount = this.initCandyCount;
    this.player.meatCount = this.initMeatCount;
    this.player.setDepth(1);

    this.physics.add.collider(this.player, walls);

    // --- Exit zone (just outside the door) ---
    this._exiting = false;
    const exitZone = this.add.zone(400, ROOM_B + 10, DOOR_W, 20);
    this.physics.add.existing(exitZone, true);
    this.physics.add.overlap(this.player, exitZone, () => this._exitHouse());

    // --- HUD ---
    this.hud = new HUD(this);
    if (this.initCandyCount > 0) {
      this.events.emit('candyCollected', this.initCandyCount);
    }
    if (this.initMeatCount > 0) {
      this.events.emit('animalCaught', this.initMeatCount);
    }
  }

  _exitHouse() {
    if (this._exiting) return;
    this._exiting = true;
    this.scene.start('WorldScene', {
      seed: this.seed,
      candyCount: this.player.candyCount,
      meatCount: this.player.meatCount,
      fromHouse: true,
    });
  }

  update() {
    if (this.player) this.player.update();
  }
}
