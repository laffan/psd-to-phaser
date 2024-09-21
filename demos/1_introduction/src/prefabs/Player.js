import  {StateMachine, State} from "./../lib/StateMachine"

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    this.moveVelocity = 50;
    this.jumpVelocity = 150;
    this.canClimb = false;

    // Add to scene
    scene.add.existing(this); // Add to scene.
    this.setOrigin(0, 0); // center player on start point
    this.setScale(0.5)

    // Physics setup
    scene.physics.add.existing(this); // add physics body to scene
    this.body.setCollideWorldBounds(true);

    const bodyWidth = 16;
    const bodyHeight = 16;
    this.body.setSize(bodyWidth, bodyHeight);

    const offsetX = 8;
    const offsetY = 16;
    this.body.setOffset(offsetX, offsetY);

    this.setGravityY(100);

    this.scene.playerFSM = new StateMachine(
      "idle",
      {
        idle: new IdleState(),
        move: new MoveState(),
        jump: new JumpState(),
      },
      [this.scene, this]
    );

    scene.anims.create({
      key: "idle",
      frameRate: 8,
      repeat: -1,
      frames: this.anims.generateFrameNumbers("character", {
        start: 0,
        end: 0,
      }),
    });

    scene.anims.create({
      key: "walk",
      frameRate: 8,
      repeat: -1,
      frames: this.anims.generateFrameNumbers("character", {
        start: 0,
        end: 7,
      }),
    });

    scene.anims.create({
      key: "jump",
      frameRate: 8,
      repeat: -1,
      frames: this.anims.generateFrameNumbers("character", {
        start: 2,
        end: 2,
      }),
    });
  }
}

class IdleState extends State {
  enter(scene, player) {
    player.setVelocityX(0);
    if (player.body.velocity.y == 0) {
      player.anims.play("idle");
    }
    player.anims.stop();
  }

  execute(scene, player) {
    const { left, right, up, down, space, shift } = scene.keys;

    if (left.isDown || right.isDown) {
      this.stateMachine.transition("move");
      return;
    }

    if (up.isDown) {
      this.stateMachine.transition("jump");
      return;
    }
  }
}

class MoveState extends State {
  enter(scene, player) {}

  execute(scene, player) {
    // use destructuring to make a local copy of the keyboard object
    const { left, right, up, down, space, shift } = scene.keys;

    // transition to idle if not pressing movement keys
    if (!(left.isDown || right.isDown || up.isDown || down.isDown)) {
      this.stateMachine.transition("idle");
      return;
    }
    if (up.isDown) {
      this.stateMachine.transition("jump");
      return;
    }

    // Move player

    let moveDirection = new Phaser.Math.Vector2(0, 0);
    if (left.isDown) {
      player.setFlipX(true);
      moveDirection.x = -1;
      player.direction = "left";
    } else if (right.isDown) {
      player.setFlipX(false);
      moveDirection.x = 1;
      player.direction = "right";
    }

    // normalize movement
    moveDirection.normalize();
    player.setVelocityX(player.moveVelocity * moveDirection.x);
    player.anims.play("walk", true);
  }
}



class JumpState extends State {
  enter(scene, player) {
    player.anims.play("jump");
    player.setVelocityY(-player.jumpVelocity);
  }
  execute(scene, player) {
    const { left, right, up, down, space, shift } = scene.keys;

    if (player.body.blocked.down) {
      this.stateMachine.transition("idle");
      return;
    }

    // Allow player to move mid air

    let moveDirection = new Phaser.Math.Vector2(0, 0);
    if (left.isDown) {
      player.setFlipX(true);
      moveDirection.x = -1;
      player.direction = "left";
    } else if (right.isDown) {
      player.setFlipX(false);
      moveDirection.x = 1;
      player.direction = "right";
    }

    // normalize movement
    moveDirection.normalize();
    player.setVelocityX(player.moveVelocity * moveDirection.x);
  }
}

export default Player;