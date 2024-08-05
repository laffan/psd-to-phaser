import { Scene } from "phaser";

export class PlayScene extends Scene {
  constructor() {
    super("PlayScene");
  }

  create() {
    console.log("Play scene reached");

    this.P2P.placeAll(this, "psd_key")


    this.lazyCam = this.P2P.createCamera(
      this.cameras.main,
      ["draggable", "lazyLoad"],
      "simple_psd",
      {
        lazyLoad: {
          extendPreloadBounds: -40,
          debug: { shape: true },
        },

        draggable: {
          // useBounds: { x: 0, y: 0, width: 1000, height: 1000 },
          easeDragging: true,
          friction: 0.95,
          minSpeed: 0.1,
        },
      }
    );

this.events.on("lazyLoadStart", (progress, currentlyLoading) => {
  console.log(`Loading is ${progress} complete.`);
  console.log(currentlyLoading); // Array of items currently loading.
});

this.events.on("lazyLoadProgress", (progress, currentlyLoading) => {
  console.log(`Loading is ${progress} complete.`);
  console.log(currentlyLoading); // Array of items currently loading.
});

this.events.on("lazyLoadingComplete", () => {
  console.log(`Lazy loading is complete.`);
});


  }

  update() {}
}
