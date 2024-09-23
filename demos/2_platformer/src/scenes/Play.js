import { Scene } from "phaser";
import Player from "./../prefabs/Player";

export class PlayScene extends Scene {
  constructor() {
    super("PlayScene");
  }

  create() {
    // Place root group
    const psd = this.P2P.place(this, "psd_key", "root");
    const playerStart = psd.target("playerStart");
    const platforms = psd.target("platforms");

    // Capture keyboard
    this.keys = this.input.keyboard.createCursorKeys();

    this.player = new Player(
      this,
      playerStart.x,
      playerStart.y,
      "player",
      0,
      "idle"
    );

  console.log(platforms);
  let platformCount = 1;

    // Add a collider to each platform
    platforms.children.entries.forEach((platform) => {
      console.log("PLATFORM", platformCount, platform)
      platformCount++;
      // Add the image platform to the physics system
      this.physics.add.existing(platform, true);
      // Have it collide with the player.
      this.physics.add.collider(this.player, platform);
    });

    // Follow player with camera
    // this.cameras.main.startFollow(this.player, true, 1, 1, 0, 20);
  }

  update() {
    this.playerFSM.step();
    // Scroll the parallax layers
    // this.midgroundObjectLayer.tilePositionX = this.cameras.main.scrollX * 0.3;
  }
}
