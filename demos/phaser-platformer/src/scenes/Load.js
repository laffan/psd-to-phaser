export class LoadScene extends Phaser.Scene {
  constructor() {
    super("LoadScene");
    this.progressText = null;
    this.phaserProgress = 0;
    this.p2jProgress = 0;
  }

  preload() {
    // Set up progress text
    this.progressText = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height / 2, "", {
        font: "24px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    // Listen for Phaser's built-in load progress
    this.load.on("progress", (value) => {
      this.phaserProgress = value;
      this.updateProgress();
    });


    // Start loading PSD data
    this.P2J.load(this, "simple_psd", "assets/simple");

    // Listen for PSD asset loading progress
    this.events.on("psdAssetsLoadProgress", (value) => {
      this.p2jProgress = value;
      this.updateProgress();
    });

    // Listen for PSD asset loading completion
    this.events.once("psdAssetsLoadComplete", this.onP2JLoadComplete, this);
  }

  updateProgress() {
    // Calculate total progress (50% Phaser, 50% P2J)
    const totalProgress = (this.phaserProgress * 0.5) + (this.p2jProgress * 0.5);
    
    // Update the progress text
    this.progressText.setText(`${Math.floor(totalProgress * 100)}%`);
  }

  onP2JLoadComplete() {
    console.log("P2J assets loaded");
    
    // Check if Phaser loading is also complete
    if (this.load.isReady()) {
      this.startPlayScene();
    }
  }

  update() {
    // Check if both Phaser and P2J loading are complete
    if (this.P2J.data.complete && this.load.isReady()) {
      this.startPlayScene();
    }
  }

  startPlayScene() {
    console.log("All assets loaded");
    this.scene.start("PlayScene");
  }
}