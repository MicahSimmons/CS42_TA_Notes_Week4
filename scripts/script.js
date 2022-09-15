
const init_model = {
  phaser_config: {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    backgroundColor: '#2d2d2d',
    parent: 'root',
    scene: [ SceneBreakout ]
  }
};

class Model {
  constructor () {
    /* This does a deep copy of static init_model inio the dynamic Model OOP class */
    Object.entries(init_model).forEach((e,i) => {
      let [k,v] = e;
      this[k] = v;
    });
  }

  setRoot (root) {
    this.phaser_config.parent = root;
  }
}

class Game {
  constructor (root) {
    this.model = new Model();
    this.model.setRoot(root);
    
    this.phaser = new Phaser.Game(this.model.phaser_config);
    this.phaser.model = this.model;
  }  
}