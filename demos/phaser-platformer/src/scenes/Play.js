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

// const getTest = this.P2P.sprites.getTexture("psd_key", "nest1");



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

    // if (simpleTexture) {
    //   const simpleEmitter = this.add.particles(20, 30, simpleTexture, {
    //     speed: 100,
    //     scale: { start: 1, end: 0 },
    //   });
    // }
   const texture = this.P2P.sprites.getTexture('psd_key', 'nest1/boxes');
   console.log(texture)

     const testEmit = this.add.particles(200, 30, texture, {
        frame: { frames: [0, 1, 2, 3], cycle: true },
        speed: 100,
        scale: { start: 1, end: 0 },
      });

const testSprite = this.add.sprite(200, 30, texture, '0');
  const hiddenTextureKey = this.P2P.sprites.getTextureKey('psd_key', 'group/group2/hiddenSpritePath');

  console.log(hiddenTextureKey);

testEmit.setDepth(1000); // Set a high depth value to ensure it's on top


    // // Atlas particle
    // const atlasTexture = this.P2P.sprites.getTexture('particles', 'atlas_particle');
    // if (atlasTexture) {
    //   const atlasEmitter = this.add.particles(600, 300, atlasTexture, {
    //     frame: { frames: ['particle1', 'particle2', 'particle3'], cycle: true },
    //     speed: 100,
    //     scale: { start: 1, end: 0 },
    //     blendMode: 'ADD'
    //   });
    
  }

  update() {}
}
