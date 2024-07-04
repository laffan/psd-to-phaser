import { Scene } from "phaser";
// import Player from "./../prefabs/Player";

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
    this.myZones = this.P2J.sprites.placeAll(this, "simple_psd");

    const startPoint = this.P2J.points.get("simple_psd", "start");
    if (!startPoint) {
      console.error("Start point not found");
      return;
    }

    // Get the demoSh spritesheet data
    // const demoTex = this.P2J.sprites.getTexture("simple_psd", "demoSh");
    const demoTex = this.P2J.sprites.getTexture("simple_psd", "nestedSprites/aNestedSprite");

console.log( demoTex )
    // Create particles
    this.add.particles(startPoint.point.x, startPoint.point.y, demoTex, {
      frame: [0], // Use all three frames from the spritesheet
      lifespan: 2000,
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      frequency: 100,
      emitting: true,
    });

    // Log success
    console.log("Emitter created successfully");
  }

  update() {}
}
