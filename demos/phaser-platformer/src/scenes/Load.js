export class LoadScene extends Phaser.Scene {
  constructor() {
    super("LoadScene");
    this.progressText = null;
    this.phaserProgress = 0;
    this.p2jProgress = 0;
  }

  preload() {

    // Start loading PSD data
    this.P2P.load.load(this, "psd_key", "assets/sensible");

    // Listen for PSD asset loading progress
    this.events.on("psdLoadProgress", (value) => {
      // console.log("Loading progress:", value);
    });

    // Listen for PSD asset loading completion
    this.events.once(
      "psdLoadComplete",
      () => {
        // console.log("PSD assets loading complete");

        this.scene.start("PlayScene");

        // Log the loaded JSON data
        const loadedData = this.P2P.getData("psd_key");
        // console.log("Loaded PSD data:", loadedData);
      },
      this
    );

    // Add error listener
    this.load.on("loaderror", (fileObj) => {
      console.error("Error loading file:", fileObj.key);
    });
  }
}
