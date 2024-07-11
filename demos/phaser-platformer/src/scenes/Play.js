import { Scene } from "phaser";

export class PlayScene extends Scene {
  constructor() {
    super("PlayScene");
  }

  create() {
    console.log("PlayScene");

    this.P2P.tiles.placeAll(this, "psd_key");
    this.P2P.points.placeAll(this, "psd_key");
    this.P2P.zones.placeAll(this, "psd_key");
    this.P2P.sprites.placeAll(this, "psd_key");

    this.lazyCamera = this.P2P.cameras.createCamera(
      this.cameras.main,
      ["lazyLoading", "draggable"],
      "psd_key",
      {
        lazyLoadingOptions: {
          extendPreloadBounds: -30,
          debug: {
            shape: true,
          },
        },
        // draggableOptions: {
        //   useBounds: { x: 0, y: 0, width: 1000, height: 1000 },
        //   easeDragging: true,
        // },
      }
    );
// const myTexture = this.P2P.sprites.getTexture("simple_psd", "nest1/miniNest");

// console.log(myTexture)

// if (myTexture) {
//   // Use texture in emitter
//   this.add.particles(100, 100, myTexture, {
//     lifespan: 2000,
//     speed: { min: 100, max: 200 },
//     angle: { min: 0, max: 360 },
//     scale: { start: 1, end: 0 },
//     frequency: 100,
//     emitting: true,
//   });
// } else {
//   console.error("Texture not found for particle emitter");
// }
 
  }

  update() {}
}
