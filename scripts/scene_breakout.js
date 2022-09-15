
/* This object controls the sound sprite parameters */
var soundCfg = {
  volume: 0.5
}

/* High level states for the game Finite State Machine. */
const States = {
  WAITING: 0,
  PLAYING: 1,
  WIN: 2,
  GAME_OVER: 3
}

/* Enhanced Sprite Object */
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

/* Enhanced Sprite Object, with Physics 
 *  Static Members define the key / assets needed, and the preload function.
 *  This pulls the complexity away from the preload in the main scene function.
 * 
 */
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
    
    if (this.soundFile != undefined) {
      scene.load.audio(this.key, this.soundFile);
    }
  }
}

/* Text Object for displaying the score.  setScore() acts
 * as the update function for the scoreboard.
 */
class ObjectScore extends Phaser.Physics.Arcade.Group {
  constructor (config) {
    super(config.scene);

    this.textObj = config.scene.add.text(config.x, config.y, "Score: ");
  }

  static preload(scene) {

  }

  setScore(newScore) {
    this.score = newScore;
    this.textObj.setText("Score: " + this.score);
  }
}

/* Text object for positive/negative feedback on user actions.
 * User is informed on victory / failure conditions, as well
 * as given an indicator of the score multiplier.
 * *
 * setStatus() acts as an update() function for just this object.
 */
class ObjectStatus extends Phaser.Physics.Arcade.Group {
  constructor (config) {
    super(config.scene);
    this.textObj = config.scene.add.text(config.x, config.y, "");
    this.textObj.setOrigin(1,0);
  }

  static preload(scene) {

  }

  setStatus(newStatus, combo) {
    this.status = newStatus;
    this.text = "";
    switch (this.status) {
      case States.WAITING:   this.text = "Click to Begin"; break;
      case States.PLAYING:   {
        /* Clever code alert.  
         *   This is an array of objects.
         *   Each row of the array is a condition to meet, and the text to display.
         *   "filter" loops through the array for all matching conditions.
         *   "reduce" loops through the array again, ignores all but the last match.
         *   .text extracts just the part I need to display from the row.
         */
        this.text = [
          { level: 0, text: "" },
          { level: 2, text: "Double!" },
          { level: 3, text: "Tripple!"},
          { level: 5, text: "Great!!!"},
          { level: 10, text: "Super!!!!!"},
          { level: 15, text: "AMAZING!"},
          { level: 20, text: "GODLIKE"}
        ].filter( (obj) => (obj.level <= combo) )
         .reduce( (prev, curr) => curr )
         .text;

      } break;
      case States.GAME_OVER: this.text = "Game Over"; break;
      case States.WIN:       this.text = "You Win!"; break;
    }
    this.textObj.setText(this.text);
  }
}

/* A Ball for doing bouncy things.  This builds on the 
 * basic physics sprite and defines ball behaviors.
 */
class ObjectBall extends ObjectPhysicsBase {
  static key = "ball";
  static imgFile = "./assets/bomb.png";
  constructor (config) {
    config.key = ObjectBall.key;
    super (config);

    this.setCollideWorldBounds(true);
    this.setBounce(1);

    this.launch = this.launch.bind(this);
  }

  /* Initial kick off of the ball speed */
  launch () {
    this.setVelocity(-75, 300);
  }

  /* Allow for variation in the X velocity, to
   * give the user some skill shot capability
   */
  nudge (offset) {
    let vx = this.body.velocity.x;
    let vy = this.body.velocity.y;
    this.setVelocity(vx+(2*offset), vy);
  }
}

/* A brick.  For breaking.
 *   Hit / Reset functions handle removing and adding the object
 *   from play.
 * 
 *   update() is called from the scene update loop and implements the 
 *   motion of each star.
 */
class ObjectBrick extends ObjectPhysicsBase {
  static key = "brick";
  static imgFile = "./assets/star.png";
  static soundFile = "./assets/flagdrop.wav";
  constructor (config) {
    config.key = ObjectBrick.key;
    super (config);
    this.hit = this.hit.bind(this);
    this.reset = this.reset.bind(this);

    this.counter = 0;
  }

  init() {
    this.setBounce(1.0);
    this.setImmovable();
    this.setOrigin(0.5);
    this.baseX = this.x;
    this.baseY = this.y;
  }

  hit () {
    this.disableBody(true, true);
    this.scene.sound.play(ObjectBrick.key, soundCfg);
  }

  reset () {
    this.enableBody(false, 0, 0, true, true);
  }

  update () {
    this.counter++;
    let x = this.x;
    let y = this.y;

    /* Sin trig function used here to get a soft oscillating movement */
    x = this.baseX + (50 * Math.sin(this.counter * Math.PI / 180.0)) * (400-this.baseX)/400;
    y = this.baseY - (50 * Math.sin(this.counter * Math.PI / 180.0))

    this.setPosition(x, y);
  }
}

/* A simple paddle object.
 *   move() moves.  hit() gives audio feedback.
 *   Immovable is set to prevent the ball from shoving the paddle off the screen.
 */
class ObjectPaddle extends ObjectPhysicsBase {
  static key = "paddle";
  static imgFile = "./assets/platform.png";
  static soundFile = "./assets/itempick1.wav";

  constructor (config) {
    config.key = ObjectPaddle.key;
    super (config);

    this.setImmovable();
    this.setScale(0.5);

    this.hit = this.hit.bind(this);
  }

  move (x) {
    this.x = x;
  }

  hit () {
    this.scene.sound.play(ObjectPaddle.key, soundCfg);
  }

}

/* Just for debug. Typing "sdbg" at the console lets me inspect my game objects */
var sdbg;

/* SceneBreakout - put all my custom game object together. */
class SceneBreakout extends Phaser.Scene {
  constructor () {
    super();

    this.objects = [
      ObjectBall, ObjectBrick, ObjectPaddle, ObjectScore, ObjectStatus
    ]

    this.score = 0;
    this.combo = 0;

    this.preload = this.preload.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
  }

  preload () {

    /* In bigger projects, I would split the objects into separate files.  
     * making an object level static preload function makes it so the scene
     * doesn't care how the smaller pieces are implemented.
     */
    for (let i = 0; i < this.objects.length; i++) {
      let objType = this.objects[i];
      objType.preload(this);
    }
    sdbg = this;
  }

  create () {
    this.state = States.WAITING;

    /* Create my UI objects */
    this.scoreBoard = new ObjectScore({ scene: this, x: 0, y: 575 })
    this.gameStatus = new ObjectStatus( { scene: this, x: 800, y: 575 });

    /* Create the player avatar */
    this.physics.world.setBoundsCollision(true, true, true, false );
    this.ball = new ObjectBall({ scene: this, x: 400, y: 450 })
    this.paddle = new ObjectPaddle( { scene: this, x: 400, y: 550 });

    /* Create the enemies.  To make the number of enemies scale, a group is
     * used to create an array of GameObjects.  A nested For loop populates
     * the array with lots and lots of game objects.  Much easier than brick1, brick2, brick3...
     */
    this.bricks = this.physics.add.group();
    for (let col = 0; col<18; col++ ) {
      for (let row = 0; row<4; row++ ) {
        this.bricks.add(new ObjectBrick( { scene: this, x: (40*col)+50, y: (75*row)+50 }), ObjectBrick.defaultConfig)
      }
    }

    /* This is also a loop.  "Each" lets you perform an action on all members of an array */
    this.bricks.children.each( (brick) => brick.init());

    /* When the ball and paddle hit:
     *   1) Play a sound.
     *   2) Adjust the ball speed based on where it hit the paddle.
     *   3) Reset the score multiplier.
     */
    this.physics.add.collider(this.ball, this.paddle, (ball, paddle) => {
      paddle.hit()
      ball.nudge(ball.x - paddle.x);
      this.combo = 0;
    });

    /* When a ball and brick hit:
     *   1) Destroy the brick.
     *   2) Add a combo bonus!
     *   3) Add to the player score.
     * 
     * Because the bricks are in a group, this only needs to be coded once!
     */
    this.physics.add.collider(this.ball, this.bricks, (ball, brick) => {
      brick.hit();
      this.combo++;
      this.score += 10 * this.combo;
    })


    /* Attach user controls */
    this.input.on( 'pointermove', (pointer) => { 
      this.paddle.move(pointer.x)
    });

    this.input.on( 'pointerup', () => { 
      if (this.state == States.WAITING) {
        this.state = States.PLAYING;
        this.ball.launch()
      }
       
    });
  }

  update () {
    /* Move my bricks around.  "Each" loops through all the bricks in the array. */
    this.bricks.children.each( (brick) => brick.update());

    /* Update the UI elements */
    this.scoreBoard.setScore(this.score);
    this.gameStatus.setStatus(this.state, this.combo);

    /* Top level of the flow chart */
    switch (this.state) {
      /* WAITING: reset the game back to initial posiitons.  Wait for the user to click */
      case States.WAITING:
        this.score = 0;
        this.bricks.getChildren().forEach( (brick) => brick.reset());
        this.ball.setPosition(this.paddle.x, 450);
        break;

      /* PLAYING: let the game continue until we run out of bricks or the ball jumps the screen */
      case States.PLAYING: {
        /* If ball goes off the screen, you lose */
        if (this.ball.y > 600) {
          this.state = States.GAME_OVER;
          setTimeout( () => { this.state = States.WAITING }, 5000);
        }

        /* If bricks are all disabled, you win */
        let winCondition = this.bricks.getChildren().reduce( (sum, brick) => { return sum && !brick.body.enable}, true)
        if (winCondition) {
          this.state = States.WIN;
          setTimeout( () => { this.state = States.WAITING }, 5000);        }
      } break;

      /* Game Over - just wait for respawn */
      case States.GAME_OVER:
        break;

      /* Win - just wait for respawn */
      case States.WIN:
        break;
    }
  }
}