import Phaser from '../phaser.js';

const WANDER_SPEED = 50;
const FLEE_SPEED   = 110;
const FLEE_RADIUS  = 150;
const SAFE_RADIUS  = 250;

const STATE = { WANDER: 'WANDER', FLEE: 'FLEE' };

export default class Animal extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'animal');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(20, 16);
    this.player = scene.player;
    this._state = STATE.WANDER;
    this._target = this._pickWanderTarget();
    this._pausing = false;
    this._pauseTimer = 0;
    this._caught = false;
  }

  update(time, delta) {
    if (this._caught) return;

    if (this._pausing) {
      this._pauseTimer -= delta;
      if (this._pauseTimer <= 0) {
        this._pausing = false;
        this._target = this._pickWanderTarget();
      }
      this.setVelocity(0, 0);
      return;
    }

    const dist = Phaser.Math.Distance.Between(
      this.x, this.y, this.player.x, this.player.y
    );

    if (this._state === STATE.WANDER) {
      if (dist < FLEE_RADIUS) {
        this._state = STATE.FLEE;
      } else {
        this._moveToward(this._target, WANDER_SPEED);
      }
    } else {
      if (dist > SAFE_RADIUS) {
        this._state = STATE.WANDER;
        this._target = this._pickWanderTarget();
      } else {
        this._fleeFrom(this.player);
      }
    }
  }

  _moveToward(target, speed) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const d  = Math.sqrt(dx * dx + dy * dy);
    if (d < 6) {
      this.setVelocity(0, 0);
      this._pausing = true;
      this._pauseTimer = 400 + Math.random() * 1200;
      return;
    }
    this.setVelocity((dx / d) * speed, (dy / d) * speed);
  }

  _fleeFrom(source) {
    const dx = this.x - source.x;
    const dy = this.y - source.y;
    const d  = Math.sqrt(dx * dx + dy * dy) || 1;
    this.setVelocity((dx / d) * FLEE_SPEED, (dy / d) * FLEE_SPEED);
  }

  _pickWanderTarget() {
    return {
      x: this.x + (Math.random() - 0.5) * 300,
      y: this.y + (Math.random() - 0.5) * 300,
    };
  }

  catch() {
    if (this._caught) return;
    this._caught = true;
    this.setVelocity(0, 0);
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 180,
      ease: 'Quad.easeIn',
      onComplete: () => this.destroy(),
    });
  }
}
