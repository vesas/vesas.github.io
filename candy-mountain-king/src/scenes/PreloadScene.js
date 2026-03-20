import Phaser from '../phaser.js';
import { generateTextures } from '../TextureFactory.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create() {
    generateTextures(this);
    this.scene.start('MenuScene');
  }
}
