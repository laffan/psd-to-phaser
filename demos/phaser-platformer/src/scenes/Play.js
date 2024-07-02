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
    // this.myZones = this.P2J.sprites.placeAll(this, "simple_psd");

    // Place group
    this.myZones = this.P2J.sprites.place(
      this,
      "nestedSprites/moreNested",
      "simple_psd"
    );

    this.nest = this.P2J.sprites.get(
      "simple_psd",
      "nestedSprites/moreNested/aNestedSprite"
    );

    console.log(this.nest);
    this.nest.sprite.setInteractive();

    this.nest.sprite.on("pointerdown", () => {
      console.log("hi");
      this.nest.sprite.setPosition(this.nest.sprite.x - 30, this.nest.sprite.y);
    });
  }

  update() {}
}
