import { TILE_SIZE } from './constants.js';

// Number of tile types — must match TileType enum count
const TILE_COUNT = 5;

export function generateTextures(scene) {
  generateTileset(scene);
  generatePlayer(scene);
  generateCandy(scene);
  generateHudCandy(scene);
  generateVillager(scene);
  generateThief(scene);
}

function makeTex(scene, key, w, h, drawFn) {
  const gfx = scene.add.graphics();
  drawFn(gfx);
  gfx.generateTexture(key, w, h);
  gfx.destroy();
}

function generateTileset(scene) {
  const w = TILE_SIZE * TILE_COUNT;
  const h = TILE_SIZE;
  makeTex(scene, 'tileset', w, h, (g) => {
    // 0: PLAINS — grass green
    g.fillStyle(0x4a7c3f);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x3a6230);
    for (let i = 0; i < 6; i++) {
      g.fillRect(3 + i * 5, 4 + (i % 3) * 8, 2, 4);
    }

    // 1: FIELDS — golden yellow + flower dots
    g.fillStyle(0xd4a017);
    g.fillRect(32, 0, 32, 32);
    const flowerColors = [0xff69b4, 0xff2020];
    for (let i = 0; i < 5; i++) {
      g.fillStyle(flowerColors[i % 2]);
      g.fillCircle(32 + 4 + i * 6, 4 + (i * 7) % 24, 2);
    }

    // 2: MOUNTAIN_BASE — brown + angled rocky lines
    g.fillStyle(0x7a5c3a);
    g.fillRect(64, 0, 32, 32);
    g.lineStyle(1, 0x5a3e22, 1);
    g.beginPath(); g.moveTo(66, 8);  g.lineTo(78, 4);  g.strokePath();
    g.beginPath(); g.moveTo(68, 18); g.lineTo(90, 12); g.strokePath();
    g.beginPath(); g.moveTo(70, 26); g.lineTo(88, 22); g.strokePath();

    // 3: MOUNTAIN_PEAK — darker brown + triangle visual cue (impassable)
    g.fillStyle(0x5a3e28);
    g.fillRect(96, 0, 32, 32);
    g.fillStyle(0x3d2a18);
    g.fillTriangle(112, 2, 100, 30, 124, 30);
    g.fillStyle(0xffffff, 0.3);
    g.fillTriangle(112, 6, 104, 28, 120, 28);

    // 4: CANDY_MOUNTAIN — hot pink + diagonal stripes + sparkles
    g.fillStyle(0xff69b4);
    g.fillRect(128, 0, 32, 32);
    g.lineStyle(3, 0xff90c8, 0.6);
    for (let i = -2; i < 6; i++) {
      const ox = 128 + i * 8;
      g.beginPath(); g.moveTo(ox, 0); g.lineTo(ox + 32, 32); g.strokePath();
    }
    g.fillStyle(0xffffff);
    const sparkles = [[132, 4], [148, 12], [138, 22], [156, 6], [142, 28]];
    for (const [sx, sy] of sparkles) {
      g.fillRect(sx, sy, 2, 2);
    }
  });
}

function generatePlayer(scene) {
  makeTex(scene, 'player', 32, 32, (g) => {
    // Gold body circle
    g.fillStyle(0xffd700);
    g.fillCircle(16, 18, 12);
    // Purple robe triangle at bottom
    g.fillStyle(0x7b3fa0);
    g.fillTriangle(4, 30, 28, 30, 16, 18);
    // Orange crown (3 teeth)
    g.fillStyle(0xff8c00);
    g.fillRect(8, 8, 16, 6);
    g.fillRect(8, 4, 4, 6);
    g.fillRect(14, 2, 4, 8);
    g.fillRect(20, 4, 4, 6);
    // Eyes
    g.fillStyle(0x000000);
    g.fillCircle(12, 19, 2);
    g.fillCircle(20, 19, 2);
    // Smile
    g.lineStyle(1.5, 0x000000);
    g.beginPath();
    g.arc(16, 20, 4, 0.2, Math.PI - 0.2);
    g.strokePath();
  });
}

function generateCandy(scene) {
  makeTex(scene, 'candy', 24, 24, (g) => {
    // Brown stick
    g.fillStyle(0x6b3a1f);
    g.fillRect(11, 14, 3, 10);
    // Pink lollipop circle
    g.fillStyle(0xff69b4);
    g.fillCircle(12, 10, 8);
    // White swirl arc
    g.lineStyle(2, 0xffffff, 0.9);
    g.beginPath();
    g.arc(12, 10, 4, -Math.PI * 0.8, Math.PI * 0.2);
    g.strokePath();
    // Red highlight dot
    g.fillStyle(0xff0066);
    g.fillCircle(9, 7, 2);
  });
}

function generateHudCandy(scene) {
  makeTex(scene, 'hud_candy', 20, 20, (g) => {
    g.fillStyle(0x6b3a1f);
    g.fillRect(9, 12, 3, 8);
    g.fillStyle(0xff69b4);
    g.fillCircle(10, 8, 7);
    g.lineStyle(1.5, 0xffffff, 0.9);
    g.beginPath();
    g.arc(10, 8, 3.5, -Math.PI * 0.8, Math.PI * 0.2);
    g.strokePath();
  });
}

function generateVillager(scene) {
  makeTex(scene, 'villager', 28, 28, (g) => {
    // Sky blue body
    g.fillStyle(0x87ceeb);
    g.fillCircle(14, 16, 10);
    // Dark hat brim
    g.fillStyle(0x2a2a2a);
    g.fillRect(6, 8, 16, 3);
    // Hat top
    g.fillRect(9, 2, 10, 8);
    // Eyes
    g.fillStyle(0x000000);
    g.fillCircle(11, 16, 2);
    g.fillCircle(17, 16, 2);
  });
}

function generateThief(scene) {
  makeTex(scene, 'thief', 28, 28, (g) => {
    // Dark red body
    g.fillStyle(0x8b0000);
    g.fillCircle(14, 16, 10);
    // Black mask across eyes
    g.fillStyle(0x111111);
    g.fillRect(7, 12, 14, 5);
    // White eye holes
    g.fillStyle(0xffffff);
    g.fillCircle(10, 14, 2);
    g.fillCircle(18, 14, 2);
    // Small bag
    g.fillStyle(0x5a3a1a);
    g.fillRect(20, 18, 6, 7);
    g.lineStyle(1, 0x3a2010);
    g.strokeRect(20, 18, 6, 7);
  });
}
