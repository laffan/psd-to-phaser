import { Scene } from "phaser";
import { loadFonts } from "../helpers/loadFonts";

export class LoadScene extends Scene {
  constructor() {
    super("LoadScene");
    this.fontsLoaded = false;
    this.assetsLoaded = false;
    this.psdLoaded = false;
  }

  preload() {
    // Start loading PSD data
    this.P2P.load.load(this, "psd_key", "assets/2_platformer");

    this.events.once(
      "psdLoadComplete",
      () => {
        this.psdLoaded = true;
      },
      this
    );

    loadFonts(
      [
        { name: "digitalDisco", url: "assets/fonts/DigitalDisco.ttf" },
        { name: "digitalDiscoThin", url: "assets/fonts/DigitalDisco-Thin.ttf" },
      ],
      this
    );

    this.events.once(`fontsLoaded_${this.scene.key}`, () => {
      this.fontsLoaded = true;
    });

    // Normal image loading
    this.load.spritesheet("character", "assets/img/MedievalRangerRun.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.on("complete", () => {
      this.assetsLoaded = true;
    });
  }

  update() {
    if (this.assetsLoaded && this.psdLoaded && this.fontsLoaded) {
      this.scene.start("PlayScene");
    }
  }
}
