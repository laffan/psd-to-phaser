import { Scene } from "phaser";

export class PlayScene extends Scene {
  constructor() {
    super("PlayScene");
  }

  create() {
    // Place the root group
    console.log("PLAY!")
    const psd = this.P2P.place(this, "psd_key", "root");

    // Target the "blobs" group
    const blobs = psd.target("blobs");
    console.log(blobs);

    // Loop through the blobs and make each one draggable
    blobs.children.entries.forEach((blob) => {
      blob.setInteractive();
      this.input.setDraggable(blob);
      this.input.on("drag", function (pointer, gameObject, dragX, dragY) {
        gameObject.x = dragX;
        gameObject.y = dragY;
      });
    });
  }

  update() {}
}
