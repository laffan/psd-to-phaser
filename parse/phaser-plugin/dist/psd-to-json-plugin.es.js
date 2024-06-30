class l extends Phaser.Plugins.BasePlugin {
  constructor(o) {
    super(o), this.psdData = [];
  }
  init() {
    this.game.events.once("destroy", this.destroy, this);
  }
  loadJSON(o, t, s) {
    o.load.json(t, s), o.load.once("complete", () => {
      const n = o.cache.json.get(t);
      this.processJSON(o, t, n);
    });
  }
  processJSON(o, t, s) {
    o.game.registry.set(t, s), console.log(o.game.registry), this.psdData[t] = s, console.log(this.psdData);
  }
  addPsd(o, t, s) {
    console.log(`Adding PSD: ${t} from ${s}`);
    const n = this.psdData[s];
    if (!n) {
      console.error(`No PSD data found for ${s}`);
      return;
    }
    const e = n.psds.find((r) => r.filename === s);
    if (!e) {
      console.error(`No PSD named ${s} found in the data`);
      return;
    }
    return console.log(`Adding PSD ${t}:`), console.log(`Dimensions: ${e.width}x${e.height}`), console.log(`Number of sprites: ${e.sprites.length}`), console.log(`Number of zones: ${e.zones.length}`), console.log(`Number of points: ${e.points.length}`), e;
  }
}
export {
  l as default
};
