import { Scene } from "phaser";

export class PlayScene extends Scene {
  constructor() {
    super("PlayScene");
  }

  create() {
    const psd = this.P2P.place(this, "psd_key", "root");
    const inspect = psd.target("atlasTest")
    console.log( "🚨🚨🚨🚨🚨🚨" )
    console.log( inspect )
    console.log( "🚨🚨🚨🚨🚨🚨" )
    // Initialize a lazyLoad camera
    this.lazyCamera = this.P2P.createCamera(
      this.cameras.main,
      ["lazyLoad", "draggable"],
      "psd_key",
      {
        draggable: {
          // useBounds: { x: 0, y: 0, width: 1000, height: 1000 },
          easeDragging: true,
          friction: 0.95,
          minSpeed: 0.1,
        },
        lazyLoad: {
          extendPreloadBounds: -30, // pull lazyLoad boundary in to debug.
          debug: {
            shape: true, // outline lazyLoad items
            label: true, // label with filename
            console: true, // show file loading in console
          },
        },
      }
    );
  }

  update() {}
}
