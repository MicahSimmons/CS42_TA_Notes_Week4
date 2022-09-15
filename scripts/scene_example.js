
class ObjectBase extends Phaser.GameObjects.Sprite {
  static key = "";
  static imgFile = "";
  constructor (config) {
    super (config.scene, config.x, config.y, config.key);
    config.scene.add.existing(this);
  
    if (config.scale != undefined) {
      this.setScale(config.scale);
    }
  }

  static preload(scene) {
    scene.load.image(this.key, this.imgFile);
  }
}

class ObjectSky extends ObjectBase {
  static key = "bg";
  static imgFile = "./assets/sky.png";
  constructor (config) {
    config.key = ObjectSky.key;
    super (config);
  }
}

class ObjectPlatform extends ObjectBase {
  static key = 'ground'; 
  static imgFile = './assets/platform.png';
  constructor (config) {
    config.key = ObjectPlatform.key;
    super (config);
  }
}


class ObjectPhysicsBase extends Phaser.Physics.Arcade.Sprite {
  static key = "";
  static imgFile = "";
  constructor (config) {
    super (config.scene, config.x, config.y, config.key);
    config.scene.physics.add.existing(this);
    config.scene.add.existing(this);

    this.setBounce(0.2);
    this.setCollideWorldBounds(true);
  }

  static preload(scene) {
    scene.load.image(this.key, this.imgFile);
  }
}

class ObjectStar extends ObjectPhysicsBase {
  static key = "star";
  static imgFile = "./assets/star.png";
  constructor (config) {
    config.key = ObjectStar.key;
    super (config);

  }
}

class ObjectDude extends ObjectPhysicsBase {
  constructor (config) {
    config.key = 'dude';
    super(config);

    let anims = config.scene.anims;
    anims.create({
      key: 'left',
      frames: anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
  
    anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });
    
    anims.create({
        key: 'right',
        frames: anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.cursors = this.scene.input.keyboard.addKeys('W,A,S,D')
  }

  update() {
    let vx = 0;
    let ani = 'turn';

    if (this.cursors.A.isDown) {
      vx = -160;
      ani = 'left'
    } else if (this.cursors.D.isDown) {
      vx = 160;
      ani = 'right'
    }

    this.setVelocityX(vx);
    this.anims.play(ani);

    if ((this.cursors.W.isDown) && (this.body.touching.down)) {
      this.setVelocityY(-330);
    }

  }
}

var world = {
  platforms: [
    {x: 400, y: 568, scale: 2},
    {x: 600, y: 400 },
    {x: 50, y: 250 },
    {x: 750, y: 220 }
  ],
  stars: [
    {x: 12, y: 0 },
    {x: 82, y: 0 },
    {x: 152, y: 0 },
    {x: 222, y: 0 },
    {x: 292, y: 0 }
  ]
}

class SceneExample extends Phaser.Scene {
  constructor () {
    super();
    this.objList = [
      ObjectSky,
      ObjectPlatform,
      ObjectStar    
    ];

    this.preload = this.preload.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
  }

  preload () {
    /* Load some image files - Params: Key, FilePath */
    //this.load.image(ObjectSky.key, ObjectSky.imgFile);
    ObjectSky.preload(this);
    this.load.image('ground', './assets/platform.png');
    this.load.image('star', './assets/star.png');
    //this.load.image('bomb', './assets/bomb.png');
    
    this.load.spritesheet('dude', './assets/dude.png', { frameWidth: 32, frameHeight: 48 })

    this.stars = this.physics.add.group();
    this.platforms = this.physics.add.staticGroup();
  }

  create () {
    /* Build a sprite that uses the image file */
    this.bg = new ObjectSky({scene: this, x: 400, y: 300})

    world.stars.forEach( (spec) => {
      this.stars.add(new ObjectStar({scene: this, x: spec.x, y: spec.y}));
    })

    world.platforms.forEach( (spec) => {
      this.platforms.add(new ObjectPlatform({scene: this, x: spec.x, y: spec.y, scale:spec.scale}));
    })

    this.player = new ObjectDude({scene: this, x: 100, y: 450 })
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);
  }

  update () {
    this.player.update();
  }
}