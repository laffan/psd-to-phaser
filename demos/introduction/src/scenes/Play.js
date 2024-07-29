import { Scene } from "phaser";

export class PlayScene extends Scene {
  constructor() {
    super("PlayScene");
    console.log("PlayScene");
  }

  create() {


this.P2P.tiles.placeAll(this, "psd_key");

this.lazyCamera = this.P2P.cameras.createCamera(
  this.cameras.main,
  ["lazyLoading",  "draggable"],
  "psd_key",
  {
    lazyLoadingOptions: {
      extendPreloadBounds: -30,
      debug: {
        shape: true,
      },
    },
  }
);

this.events.on("loadProgress", (progress, currentlyLoading) => {
  console.log(`lazy loading is ${progress} complete.`);
  console.log(currentlyLoading); // Array of items currently loading.
});

this.events.on("loadingComplete", () => {
  console.log(`Lazy loading is complete.`);
});


    // this.P2P.tiles.placeAll(this, "psd_key");
    // this.P2P.points.placeAll(this, "psd_key");
    // this.P2P.zones.placeAll(this, "psd_key");
    // this.P2P.sprites.placeAll(this, "psd_key");

    // const hills = this.P2P.tiles.get("psd_key", "dotHills");
    // const sun = this.P2P.sprites.get("psd_key", "sun")
    // console.log(hills);
    // console.log(sun);
    // sun.placed.setDepth(0.5);

    // this.lazyCamera = this.P2P.cameras.createCamera(
    //   this.cameras.main,
    //   ["lazyLoading", "draggable"],
    //   "psd_key",
    //   {
    //     lazyLoadingOptions: {
    //       extendPreloadBounds: -30,
    //       debug: {
    //         shape: true,
    //       },
    //     },
    //   }
    // );

    ///////////////////////////////////////////////////////
    /////////// DEMOS /////////////////////////////////////
    ///////////////////////////////////////////////////////

    /*
    ////////////////////////////////////////////////
    Fill a zone with a sprite!
    ////////////////////////////////////////////////
    */

    // const fillZone = this.P2P.zones.get(
    //   "psd_key",
    //   "zoneNest/zoneNest2/complexZone"
    // );
    // const fillTexture = this.P2P.sprites.getTexture(
    //   "psd_key",
    //   "nest1/miniNest"
    // );

    // console.log("fillZone:");
    // console.log(fillZone);
    // console.log("texture:");
    // console.log(fillTexture);

    // if (fillZone && fillTexture) {
    //   // Create a Phaser.Geom.Polygon from the subpaths
    //   const points = fillZone.subpaths[0].map(
    //     (point) => new Phaser.Geom.Point(point[0], point[1])
    //   );
    //   const zoneShape = new Phaser.Geom.Polygon(points);

    //   // Use the bbox for the bounds
    //   const bounds = new Phaser.Geom.Rectangle(
    //     fillZone.bbox.left,
    //     fillZone.bbox.top,
    //     fillZone.bbox.right - fillZone.bbox.left,
    //     fillZone.bbox.bottom - fillZone.bbox.top
    //   );

    //   // Fill the zone with sprites using random frames
    //   for (let i = 0; i < 100; i++) {
    //     // Adjust the number of sprites as needed
    //     const randomX = Phaser.Math.Between(bounds.left, bounds.right);
    //     const randomY = Phaser.Math.Between(bounds.top, bounds.bottom);
    //     const randomFrame = Phaser.Math.Between(
    //       0,
    //       Object.keys(fillTexture.frames).length - 2
    //     );

    //     if (Phaser.Geom.Polygon.Contains(zoneShape, randomX, randomY)) {
    //       const sprite = this.add.sprite(
    //         randomX,
    //         randomY,
    //         fillTexture.key,
    //         randomFrame
    //       );
    //       sprite.setScale(0.5);
    //       sprite.setDepth(1000);
    //     }
    //   }
    // }
    ////////////////////////////////////////////////
    /* Follow a Zone boundary! */
    ////////////////////////////////////////////////

    // const followZone = this.P2P.zones.get("psd_key", "zoneNest/loop");
    // const followTexture = this.P2P.sprites.getTexture(
    //   "psd_key",
    //   "nest1/miniNest"
    // );

    // if (followZone && followTexture) {
    //   // Create a Phaser.Curves.Spline from the subpaths
    //   const points = followZone.subpaths[0].map(
    //     (point) => new Phaser.Math.Vector2(point[0], point[1])
    //   );
    //   const path = new Phaser.Curves.Spline(points);

    //   // Create a sprite to follow the path
    //   const follower = this.add.follower(
    //     path,
    //     points[0].x,
    //     points[0].y,
    //     followTexture.key,
    //     3
    //   );

    //   // Start following the path
    //   follower.startFollow({
    //     duration: 6000,
    //     positionOnPath: true,
    //     repeat: -1,
    //     rotateToPath: true,
    //     verticalAdjust: true,
    //   });
      
    //   follower.setDepth(1000);

    // }
    ////////////////////////////////////////////////
    /* Emission! */
    ////////////////////////////////////////////////


    // const emitTexture = this.P2P.sprites.getTexture(
    //   "psd_key",
    //   "nest1/miniNest"
    // );

    // const testEmit = this.add.particles(200, 30, emitTexture, {
    //   frame: [0, 1, 2, 3],
    //   speed: 100,
    //   scale: { start: 1, end: 0 },
    // });

    // testEmit.setDepth(1000); // Set a high depth value to ensure it's on top
  }

  update() {}
}
