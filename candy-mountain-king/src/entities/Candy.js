import Phaser from '../phaser.js';

export default class Candy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'candy');
    // No manual physics.add.existing — WorldScene adds this to a staticGroup
    // which automatically creates the static body.
    scene.add.existing(this);
    this.baseY = y;
    this._collected = false;
  }

  update(time) {
    if (!this._collected) {
      this.y = this.baseY + Math.sin(time * 0.003) * 3;
    }
  }

  collect() {
    if (this._collected) return;
    this._collected = true;
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => this.destroy(),
    });
  }
}
