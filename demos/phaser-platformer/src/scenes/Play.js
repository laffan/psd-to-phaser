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
          transitionStyle: "fade", // method of adding the tile
          debug: {
            shape: true
          }
        },
        draggableOptions: {
          easeDragging: true,
        },
      }
    );

    this.events.on("loadProgress", (progress, currentlyLoading) => {
      console.log(`Loading is ${progress} complete.`);
      console.log(currentlyLoading); // Array of items currently loading.
    });

    this.events.on("loadingComplete", () => {
      console.log(`Lazy loading is complete.`);
    });

    // // console.log(this.cameras.main);
    // this.dragCam = this.P2P.cameras.createCamera(
    //   this.cameras.main,
    //   ["draggable"],
    //   "simple_psd",
    //   {
    //     draggableOptions: {
    //       useBounds: { x: 0, y: 0 , width:500, height: 500 },
    //       easeDragging: true,
    //     },
    //   }
    // );

    // this.events.on("dragOnStart", () => {
    //   console.log(`Drag has begun.`);
    // });

    // this.events.on("isDragging", () => {
    //   console.log(`Draggin.`);
    // });

    // this.events.on("dragOnComplete", () => {
    //   console.log(`Drag has completed.`);
    // });
  }

  update() {}
}
