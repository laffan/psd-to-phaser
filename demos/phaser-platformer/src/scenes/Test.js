export class TestScene extends Phaser.Scene {
  constructor() {
    super("TestScene");
  }

preload() {
    console.log("Preload function called");

    // Start loading PSD data
    this.P2P.load.load(this, "simple_psd", "assets/simple");

    // Listen for PSD asset loading progress
    this.events.on("psdAssetsLoadProgress", (value) => {
        console.log("Loading progress:", value);
    });

    // Listen for PSD asset loading completion
    this.events.once("psdAssetsLoadComplete", () => {
        console.log("PSD assets loading complete");
        
        // Log the loaded JSON data
        const loadedData = this.P2P.getData("simple_psd");
        console.log("Loaded PSD data:", loadedData);
    }, this);

    // Add error listener
    this.load.on('loaderror', (fileObj) => {
        console.error('Error loading file:', fileObj.key);
    });
}

  update() {
  }

}