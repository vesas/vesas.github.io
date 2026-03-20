import Phaser from '../phaser.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Background gradient-ish
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0a2e, 0x1a0a2e, 0x2d1b4e, 0x2d1b4e, 1);
    bg.fillRect(0, 0, width, height);

    // Decorative candy icons
    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(20, width - 20);
      const y = Phaser.Math.Between(20, height - 20);
      const icon = this.add.image(x, y, 'candy').setAlpha(0.25).setScale(0.8 + Math.random() * 0.6);
      this.tweens.add({
        targets: icon,
        y: y - 10,
        duration: 1500 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 1000,
      });
    }

    // Title shadow
    this.add.text(width / 2 + 3, height / 2 - 120 + 3, 'Candy Mountain King', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#330033',
    }).setOrigin(0.5);

    // Title
    this.add.text(width / 2, height / 2 - 120, 'Candy Mountain King', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ff69b4',
      stroke: '#ffffff',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 2 - 60, '👑 Collect the candy!', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffd700',
    }).setOrigin(0.5);

    // Play button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xff69b4);
    btnBg.fillRoundedRect(width / 2 - 90, height / 2 + 10, 180, 54, 12);
    btnBg.lineStyle(3, 0xffffff);
    btnBg.strokeRoundedRect(width / 2 - 90, height / 2 + 10, 180, 54, 12);

    const btnText = this.add.text(width / 2, height / 2 + 37, 'PLAY', {
      fontSize: '32px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#880044',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Make button interactive
    const hitZone = this.add.zone(width / 2, height / 2 + 37, 180, 54).setInteractive();

    hitZone.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0xff90c8);
      btnBg.fillRoundedRect(width / 2 - 90, height / 2 + 10, 180, 54, 12);
      btnBg.lineStyle(3, 0xffffff);
      btnBg.strokeRoundedRect(width / 2 - 90, height / 2 + 10, 180, 54, 12);
    });

    hitZone.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0xff69b4);
      btnBg.fillRoundedRect(width / 2 - 90, height / 2 + 10, 180, 54, 12);
      btnBg.lineStyle(3, 0xffffff);
      btnBg.strokeRoundedRect(width / 2 - 90, height / 2 + 10, 180, 54, 12);
    });

    hitZone.on('pointerdown', () => {
      this.scene.start('WorldScene', { seed: Date.now() });
    });

    // Controls hint
    this.add.text(width / 2, height / 2 + 100, 'Arrow keys or WASD to move', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaaacc',
    }).setOrigin(0.5);
  }
}
