import Phaser from '../phaser.js';

const STATE = { WANDER: 'wander', CHASE: 'chase' };

export default class NPC extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {'villager'|'thief'} type
   * @param {Phaser.GameObjects.Group} [candyGroup] — required for thieves
   */
  constructor(scene, x, y, type, candyGroup = null) {
    super(scene, x, y, type);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(type === 'villager' ? 24 : 20, type === 'villager' ? 24 : 20);

    this.npcType = type;
    this.candyGroup = candyGroup;
    this.speed = type === 'villager' ? 60 : 90;
    this._state = STATE.WANDER;
    this._target = null;
    this._pauseTimer = 0;
    this._pausing = false;

    this._pickWanderTarget();
  }

  update(time, delta) {
    if (this._pausing) {
      this._pauseTimer -= delta;
      if (this._pauseTimer <= 0) {
        this._pausing = false;
        this._pickWanderTarget();
      }
      this.setVelocity(0, 0);
      return;
    }

    if (this.npcType === 'thief') {
      this._updateThief();
    } else {
      this._moveToward(this._target, this.speed);
    }
  }

  _updateThief() {
    if (this._state === STATE.WANDER) {
      // Scan for nearby candy
      if (this.candyGroup) {
        let nearest = null;
        let nearestDist = 200;
        this.candyGroup.getChildren().forEach((candy) => {
          const d = Phaser.Math.Distance.Between(this.x, this.y, candy.x, candy.y);
          if (d < nearestDist) { nearestDist = d; nearest = candy; }
        });
        if (nearest) {
          this._state = STATE.CHASE;
          this._chaseTarget = nearest;
        }
      }
      this._moveToward(this._target, this.speed);
    } else {
      // CHASE
      if (!this._chaseTarget || !this._chaseTarget.active ||
          Phaser.Math.Distance.Between(this.x, this.y, this._chaseTarget.x, this._chaseTarget.y) > 300) {
        this._state = STATE.WANDER;
        this._chaseTarget = null;
        this._pickWanderTarget();
        return;
      }
      this._moveToward({ x: this._chaseTarget.x, y: this._chaseTarget.y }, this.speed * 1.3);
    }
  }

  _moveToward(target, speed) {
    if (!target) return;
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 6) {
      this.setVelocity(0, 0);
      // Pause 0.5–2s then pick new target
      this._pausing = true;
      this._pauseTimer = 500 + Math.random() * 1500;
      return;
    }

    const nx = dx / dist;
    const ny = dy / dist;
    this.setVelocity(nx * speed, ny * speed);
  }

  _pickWanderTarget() {
    this._target = {
      x: this.x + (Math.random() - 0.5) * 200,
      y: this.y + (Math.random() - 0.5) * 200,
    };
  }
}
