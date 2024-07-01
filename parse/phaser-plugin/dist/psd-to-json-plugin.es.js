function h(s) {
  let t = 0, i = !1;
  return {
    load(e, o, a, r = {}) {
      const n = `${a}/data.json`;
      e.load.json(o, n), e.load.once("complete", () => {
        const d = e.cache.json.get(o);
        this.processJSON(e, o, d, a, r);
      });
    },
    processJSON(e, o, a, r, n) {
      e.game.registry.set(o, a), s.psdData[o] = a, s.options.debug && console.log(`Loaded JSON for key "${o}":`, a), n.noPreloading ? (i = !0, e.events.emit("psdAssetsLoadComplete"), s.options.debug && console.log("JSON loaded. Skipping asset preloading.")) : this.loadAssetsFromJSON(e, a, r);
    },
    loadAssetsFromJSON(e, o, a) {
      const r = (o.sprites || []).filter((p) => !p.lazyLoad), n = (o.tiles || []).filter((p) => !p.lazyLoad);
      let d = s.sprites.countSprites(r) + s.tiles.countTiles(n), l = 0;
      s.options.debug && (console.log(`Total assets to load: ${d}`), console.log(`Sprites to preload: ${r.length}`), console.log(`Tiles to preload: ${n.length}`)), r.length > 0 && s.sprites.load(e, r, a), n.length > 0 && s.tiles.load(e, n, a), e.load.on("filecomplete", () => {
        l++, t = l / d, e.events.emit("psdAssetsLoadProgress", t), s.options.debug && (console.log(`Loaded asset ${l} of ${d}`), console.log(`Loading progress: ${(t * 100).toFixed(2)}%`));
      }), e.load.on("complete", () => {
        i = !0, t = 1, e.events.emit("psdAssetsLoadComplete"), s.options.debug && console.log("All preloaded PSD assets loaded"), s.sprites.create(e, r);
      }), e.load.start();
    },
    get progress() {
      return t;
    },
    get complete() {
      return i;
    }
  };
}
function m(s) {
  return {
    // Implementation for points
  };
}
function $(s) {
  return {
    load(t, i, e) {
      if (!Array.isArray(i)) {
        console.warn("No sprites to load or invalid sprites data");
        return;
      }
      i.forEach((o) => {
        this.loadSprite(t, o, e);
      });
    },
    loadSprite(t, i, e) {
      const {
        name: o,
        type: a,
        filename: r,
        x: n,
        y: d,
        width: l,
        height: p,
        frameWidth: g,
        frameHeight: c,
        frameCount: f
      } = i, u = `${e}/sprites/${r || o}`;
      switch (a) {
        case "spritesheet":
          t.load.spritesheet(o, `${u}.png`, {
            frameWidth: g || l,
            frameHeight: c || p
          });
          break;
        case "atlas":
          t.load.atlas(o, `${u}.png`, `${u}.json`);
          break;
        case "animation":
          t.load.spritesheet(o, `${u}.png`, {
            frameWidth: g || l,
            frameHeight: c || p,
            endFrame: f
          });
          break;
        case "merge":
        case void 0:
        case null:
        case "":
        default:
          t.load.image(o, `${u}.png`);
          break;
      }
      s.options.debug && console.log(`Loaded sprite: ${o} (${a || "image"})`);
    },
    createSprite(t, i) {
      const { name: e, x: o, y: a, type: r, frameRate: n, repeat: d } = i;
      let l;
      switch (r) {
        case "spritesheet":
        case "atlas":
          l = t.add.sprite(o, a, e);
          break;
        case "animation":
          l = t.add.sprite(o, a, e), t.anims.create({
            key: `${e}_anim`,
            frames: t.anims.generateFrameNumbers(e, {
              start: 0,
              end: -1
            }),
            frameRate: n || 24,
            repeat: d === void 0 ? -1 : d
          }), l.play(`${e}_anim`);
          break;
        case "merge":
        case void 0:
        case null:
        case "":
        default:
          l = t.add.image(o, a, e);
          break;
      }
      return s.options.debug && console.log(`Created sprite: ${e} at (${o}, ${a})`), l;
    },
    countSprites(t) {
      return Array.isArray(t) ? t.reduce((i, e) => e.type === "multi" && Array.isArray(e.components) ? i + this.countSprites(e.components) : i + 1, 0) : 0;
    }
  };
}
function b(s) {
  return {
    load(t, i) {
    },
    countTiles(t) {
      return t ? t.layers.length * t.columns * t.rows : 0;
    }
  };
}
function S(s) {
  return {
    // Implementation for zones
  };
}
class y extends Phaser.Plugins.BasePlugin {
  constructor(t) {
    super(t), this.psdData = {}, this.options = { debug: !1 };
  }
  boot() {
    this.pluginManager.game.events.once("destroy", this.destroy, this);
  }
  init(t = {}) {
    this.options = { ...this.options, ...t }, this.data = h(this), this.points = m(), this.sprites = $(this), this.tiles = b(), this.zones = S(), this.options.debug && console.log("PsdToJSONPlugin initialized with options:", this.options);
  }
  load(t, i, e) {
    this.data.load(t, i, e);
  }
}
export {
  y as default
};
