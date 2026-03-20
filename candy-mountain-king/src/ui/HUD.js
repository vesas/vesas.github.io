export default class HUD {
  constructor(scene) {
    this.scene = scene;
    this.count = 0;
    this._build();
    scene.events.on('candyCollected', this._onCollect, this);
  }

  _build() {
    const s = this.scene;

    // Panel background
    this.panel = s.add.graphics();
    this.panel.fillStyle(0x000000, 0.55);
    this.panel.fillRoundedRect(10, 10, 160, 44, 8);
    this.panel.setScrollFactor(0).setDepth(10);

    // Candy icon
    this.icon = s.add.image(32, 32, 'hud_candy')
      .setScrollFactor(0).setDepth(11).setScale(1.1);

    // Count text
    this.label = s.add.text(52, 20, 'x 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#ff69b4',
      stroke: '#000000',
      strokeThickness: 3,
    }).setScrollFactor(0).setDepth(11);
  }

  _onCollect(count) {
    this.count = count;
    this.label.setText(`x ${count}`);
    // Pulse icon
    this.scene.tweens.add({
      targets: this.icon,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 60,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => this.icon.setScale(1.1),
    });
  }
}
