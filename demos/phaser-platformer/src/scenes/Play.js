import { Scene } from "phaser";

export class PlayScene extends Scene {
  constructor() {
    super("PlayScene");
  }

  create() {
    console.log("PlayScene");

    this.P2P.tiles.placeAll(this, "simple_psd");
    this.P2P.points.placeAll(this, "simple_psd");
    this.P2P.zones.placeAll(this, "simple_psd");
    this.P2P.sprites.placeAll(this, "simple_psd");

    this.nested = this.P2P.sprites.get(
      "simple_psd",
      "nestedSprites/demoInst"
    );
    console.log(this.nested);

    // Returns an array of all sprites placed
    this.allSprites = this.P2P.sprites.getAll("simple_psd");
    console.log(this.allSprites);

    // Returns an array of any sprites placed in top level.
    // (If you have placed sprites but they aren't at that level, will return empty array)
    
    this.topLevel = this.P2P.sprites.getAll("simple_psd", { depth: 1 });
    console.log(this.topLevel);

  }

  update() {}
}
