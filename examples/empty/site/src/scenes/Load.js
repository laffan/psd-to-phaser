export class LoadScene extends Phaser.Scene {
  constructor() {
    super("LoadScene");
  }

  preload() {
    // Start loading PSD data
    this.P2P.load.load(this, "psd_key", "assets/empty");

    // Listen for PSD asset loading completion
    this.events.once( "psdLoadComplete", () => {
        this.scene.start("PlayScene");
      }, this );
      
  }
}
