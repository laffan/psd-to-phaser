import { Scene } from "phaser";

export class PlayScene extends Scene {
  constructor() {
    super("PlayScene");
  }

  create() {
    // Place the root group
    const psd = this.P2P.place(this, "psd_key", "root");
    // (That's it! It's there!)

    // 🌸 1. Let's make all the blobs draggable.

    // Target the "blobs" group
    const blobs = psd.target("blobs");

    // Loop through the blobs and make each one draggable
    blobs.children.entries.forEach((blob) => {
      blob.setInteractive();
      this.input.setDraggable(blob);
      this.input.on("drag", function (pointer, gameObject, dragX, dragY) {
        gameObject.x = dragX;
        gameObject.y = dragY;
      });
    });

    // 🌼 2. Now, let's use the texture from a hidden layer to create an emitter.

    // Get the x & y of our emit point.
    const { x, y } = psd.target("emitPoint");
    // Use the getTexture function to get the frames from the "seeds" spritesheet.
    const emitTexture = this.P2P.getTexture(this, "psd_key", "root/seeds");

    // Emit!
    this.add.particles(x, y, emitTexture, {
      frame: [0, 1, 2, 3, 5],
      speedX: { min: -20, max: 20 },
      speedY: { min: -10, max: 30 },
      lifespan: { min: 3000, max: 5000 }, 
      scale: { start: 1, end: 0.5 }, 
      alpha: { start: 1, end: 0 }, 
      angle: { min: -20, max: 20 }, 
      gravityY: 100,
      frequency: 100,
    }).setDepth(3);
  }

  update() {}
}
