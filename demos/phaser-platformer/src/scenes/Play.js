import { Scene } from "phaser";

export class PlayScene extends Scene {
  constructor() {
    super("PlayScene");
  }

  create() {
    console.log("PlayScene");

    // this.P2P.points.placeAll(this, "simple_psd", {
    //   debugConsole: true,
    //   debugShape: true,
    //   debugLabel: false,
    // });
    
    // this.P2P.zones.placeAll(this, "simple_psd", {
    //   debugConsole: true,
    //   debugShape: false,
    //   debugLabel: true,
    // });
    this.P2P.points.placeAll(this, "simple_psd", {
      debug: true,
    });
    
    this.P2P.zones.placeAll(this, "simple_psd", {
      debug: true,
    });
  }

  update() {}
}
