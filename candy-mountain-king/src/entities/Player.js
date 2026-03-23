import Phaser from '../phaser.js';

const SPEED = 160;

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(24, 24);
    this.setCollideWorldBounds(true);
    this.candyCount = 0;
    this.meatCount = 0;

    this._keys = scene.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.UP,
      down:  Phaser.Input.Keyboard.KeyCodes.DOWN,
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w:     Phaser.Input.Keyboard.KeyCodes.W,
      s:     Phaser.Input.Keyboard.KeyCodes.S,
      a:     Phaser.Input.Keyboard.KeyCodes.A,
      d:     Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  update() {
    const k = this._keys;
    let vx = 0;
    let vy = 0;

    if (k.left.isDown  || k.a.isDown) vx = -1;
    if (k.right.isDown || k.d.isDown) vx =  1;
    if (k.up.isDown    || k.w.isDown) vy = -1;
    if (k.down.isDown  || k.s.isDown) vy =  1;

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.setVelocity(vx * SPEED, vy * SPEED);
  }

  collectCandy() {
    this.candyCount++;
    this.scene.events.emit('candyCollected', this.candyCount);
    // Brief scale feedback
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  catchAnimal() {
    this.meatCount++;
    this.scene.events.emit('animalCaught', this.meatCount);
  }
}
