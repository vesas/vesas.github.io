import Phaser from '../phaser.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    this.load.image('tile_plains',         'assets/tile_plains.png');
    this.load.image('tile_fields',         'assets/tile_fields.png');
    this.load.image('tile_mountain_base',  'assets/tile_mountain_base.png');
    this.load.image('tile_mountain_peak',  'assets/tile_mountain_peak.png');
    this.load.image('tile_candy_mountain', 'assets/tile_candy_mountain.png');
    this.load.image('player',    'assets/player.png');
    this.load.image('candy',     'assets/candy.png');
    this.load.image('hud_candy', 'assets/hud_candy.png');
    this.load.image('villager',  'assets/villager.png');
    this.load.image('thief',     'assets/thief.png');
    this.load.image('animal',    'assets/bunny.png');
  }

  create() {
    // Forest tile: dark canopy with lighter center spot
    const gForest = this.add.graphics();
    gForest.fillStyle(0x1a4d10);
    gForest.fillRect(0, 0, 32, 32);
    gForest.fillStyle(0x0e3308);
    gForest.fillRect(2, 2, 10, 12);
    gForest.fillRect(20, 6, 10, 10);
    gForest.fillRect(8, 18, 14, 10);
    gForest.fillStyle(0x2a6318);
    gForest.fillRect(5, 5, 6, 6);
    gForest.fillRect(22, 8, 5, 5);
    gForest.fillRect(11, 20, 8, 6);
    gForest.generateTexture('tile_forest', 32, 32);
    gForest.destroy();

    // Rocks tile: grey boulders on lighter base
    const gRocks = this.add.graphics();
    gRocks.fillStyle(0x9a9a9a);
    gRocks.fillRect(0, 0, 32, 32);
    gRocks.fillStyle(0x666666);
    gRocks.fillRect(2, 3, 13, 9);
    gRocks.fillRect(17, 8, 11, 12);
    gRocks.fillRect(4, 18, 9, 10);
    gRocks.fillStyle(0xbbbbbb);
    gRocks.fillRect(3, 4, 5, 3);
    gRocks.fillRect(18, 9, 4, 3);
    gRocks.generateTexture('tile_rocks', 32, 32);
    gRocks.destroy();

    // Generate house texture programmatically
    const g = this.add.graphics();
    // Roof
    g.fillStyle(0x8b2020);
    g.fillRect(0, 0, 64, 64);
    g.fillStyle(0xa03535);
    g.fillRect(6, 6, 52, 34);
    // Walls (bottom strip)
    g.fillStyle(0xd4a06e);
    g.fillRect(0, 42, 64, 22);
    // Door opening
    g.fillStyle(0x1a0500);
    g.fillRect(24, 42, 16, 22);
    // Windows
    g.fillStyle(0x87ceeb);
    g.fillRect(6, 20, 12, 10);
    g.fillRect(46, 20, 12, 10);
    g.lineStyle(1, 0x3a1a00, 1);
    g.strokeRect(6, 20, 12, 10);
    g.strokeRect(46, 20, 12, 10);
    g.generateTexture('house', 64, 64);
    g.destroy();

    // Meat HUD icon
    const gMeat = this.add.graphics();
    gMeat.fillStyle(0xaa7733, 1);
    gMeat.fillRect(0, 4, 18, 12);
    gMeat.fillStyle(0xcc9944, 1);
    gMeat.fillRect(2, 2, 6, 4);
    gMeat.generateTexture('hud_meat', 24, 20);
    gMeat.destroy();

    this.scene.start('MenuScene');
  }
}
