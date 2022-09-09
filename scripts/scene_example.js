
class ObjectExample extends Phaser.GameObjects.Image {
  constructor (config) {
    super (config.scene, config.x, config.y, "bg");
  }
}

class SceneExample extends Phaser.Scene {
  constructor () {
    super();
  }

  preload () {
    /* Load some image files - Params: Key, FilePath */
    this.load.image("bg", "./assets/background.png");
  }

  create () {
    /* Build a sprite that uses the image file */
    this.bg = new ObjectExample({scene: this, x: 400, y: 300})
    this.add.existing(this.bg);

  }

  update () {
    /* Is there anything we need the sprite to actually do? */
  }
}