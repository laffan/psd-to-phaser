import { Scene } from "phaser";

export class PlayScene extends Scene {
  constructor() {
    super("PlayScene");
  }

  create() {
    console.log("PlayScene");
    // Capture keyboard

    this.myTiles = this.P2J.tiles.placeAll(this, "simple_psd");
    this.myPoints = this.P2J.points.placeAll(this, "simple_psd");
    this.myZones = this.P2J.zones.placeAll(this, "simple_psd");
    this.mySprites = this.P2J.sprites.placeAll(this, "simple_psd");


// Retreive texture
const emitPoint = this.P2J.points.get("simple_psd", "start");
const emitTex = this.P2J.sprites.getTexture("simple_psd", "demoSh");

// Use texture in emitter
this.add.particles(emitPoint.point.x, emitPoint.point.y, emitTex, {
  frame: [0, 1, 2], // Use all three frames from the spritesheet
  lifespan: 2000,
  speed: { min: 100, max: 200 },
  angle: { min: 0, max: 360 },
  scale: { start: 1, end: 0 },
  frequency: 100,
  emitting: true,
});



  }

  update() {}
}
