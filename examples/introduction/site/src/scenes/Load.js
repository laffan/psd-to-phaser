export class LoadScene extends Phaser.Scene {
  constructor() {
    super("LoadScene");
  }

  preload() {
    // Start loading PSD data
    this.P2P.load.load(this, "psd_key", "assets/1_introduction");

    // Listen for PSD asset loading progress
    this.events.on("psdLoadProgress", (value) => {
      // console.log("Loading progress:", value);
    });

    // Listen for PSD asset loading completion
    this.events.once(
      "psdLoadComplete",
      () => {
        this.scene.start("PlayScene");
      },
      this
    );

    // Add error listener
    this.load.on("loaderror", (fileObj) => {
      console.error("Error loading file:", fileObj.key);
    });
  }
}
