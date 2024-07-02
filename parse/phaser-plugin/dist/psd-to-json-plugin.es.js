var w = Object.defineProperty;
var D = (n, t, o) => t in n ? w(n, t, { enumerable: !0, configurable: !0, writable: !0, value: o }) : n[t] = o;
var m = (n, t, o) => (D(n, typeof t != "symbol" ? t + "" : t, o), o);
function S(n) {
  let t = 0, o = !1;
  return {
    load(e, i, s) {
      const l = `${s}/data.json`;
      e.load.json(i, l), e.load.once("complete", () => {
        const r = e.cache.json.get(i);
        this.processJSON(e, i, r, s);
      });
    },
    processJSON(e, i, s, l) {
      n.psdData[i] = {
        ...s,
        basePath: l
      }, n.options.debug && console.log(`Loaded JSON for key "${i}":`, n.psdData[i]), this.loadAssetsFromJSON(e, i, n.psdData[i]);
    },
    loadAssetsFromJSON(e, i, s) {
      const l = s.sprites || [], r = s.tiles || {};
      let a = n.sprites.countSprites(l) + n.tiles.countTiles(r), d = 0;
      n.options.debug && console.log(`Total assets to load: ${a}`);
      const c = () => {
        d++, t = d / a, e.events.emit("psdAssetsLoadProgress", t), n.options.debug && (console.log(`Loaded asset ${d} of ${a}`), console.log(`Loading progress: ${(t * 100).toFixed(2)}%`)), d === a && (o = !0, e.events.emit("psdAssetsLoadComplete"), n.options.debug && console.log("All PSD assets loaded"));
      };
      l.length > 0 && n.sprites.load(e, l, s.basePath, c), r.layers && r.layers.length > 0 && n.tiles.load(e, r, s.basePath, c), a === 0 && (o = !0, e.events.emit("psdAssetsLoadComplete")), e.load.isLoading() || e.load.start();
    },
    get progress() {
      return t;
    },
    get complete() {
      return o;
    }
  };
}
const g = class g {
  constructor(t) {
    this.name = t.name, Object.keys(t).forEach((o) => {
      o !== "name" && (this[o] = t[o]);
    });
  }
  isStandardProp(t) {
    return g.standardProps.includes(t);
  }
  getCustomAttributes() {
    return Object.keys(this).filter((t) => !this.isStandardProp(t)).reduce((t, o) => (t[o] = this[o], t), {});
  }
  addDebugVisualization(t, o) {
    let e;
    const i = "0xff00de";
    switch (o) {
      case "sprite":
        e = t.add.graphics(), e.lineStyle(2, i, 1), e.strokeRect(this.x, this.y, this.width, this.height);
        break;
      case "zone":
        const s = t.add.container(this.bbox.left, this.bbox.top);
        if (this.subpaths && this.subpaths.length > 0) {
          const l = this.bbox.right - this.bbox.left, r = this.bbox.bottom - this.bbox.top, a = t.add.rectangle(0, 0, l, r, i, 0.5);
          a.setOrigin(0, 0), s.add(a);
        }
        e = s;
        break;
      case "point":
        e = t.add.circle(this.x, this.y, 10, i, 0.5);
        break;
      default:
        console.warn(`Unknown debug visualization type: ${o}`);
    }
    return e;
  }
};
m(g, "standardProps", ["name"]);
let $ = g;
function u(n) {
  return new $(n);
}
function x(n) {
  return {
    place(t, o, e, i = {}) {
      const s = n.getData(e);
      if (!s || !s.points)
        return console.warn(`Point data for key '${e}' not found.`), null;
      const l = s.points.find((d) => d.name === o);
      if (!l)
        return console.warn(
          `Point '${o}' not found in PSD data for key '${e}'.`
        ), null;
      const r = u(l), a = r.addDebugVisualization(
        t,
        "point",
        n,
        i
      );
      return n.options.debug && console.log(`Placed point: ${o} at (${r.x}, ${r.y})`), { layerData: r, debugGraphics: a };
    },
    countPoints(t) {
      return Array.isArray(t) ? t.length : 0;
    }
  };
}
function z(n) {
  return {
    load(t, o, e, i) {
      o.forEach((s) => {
        this.loadSprite(t, s, e, i);
      });
    },
    loadSprite(t, o, e, i) {
      const s = u(o), { name: l, filename: r } = s, a = `${e}/sprites/${r || l}.png`;
      t.load.image(l, a), t.load.once(`filecomplete-image-${l}`, i), n.options.debug && console.log(`Loading sprite: ${l} from ${a}`);
    },
    create(t, o) {
      return o.map((e) => {
        const i = u(e), { name: s, x: l, y: r, width: a, height: d } = i, c = t.add.image(l, r, s);
        return a !== void 0 && d !== void 0 && c.setDisplaySize(a, d), n.options.debug && console.log(`Created sprite: ${s} at (${l}, ${r})`), { layerData: i, image: c };
      });
    },
    place(t, o, e) {
      const i = n.getData(e);
      if (!i || !i.sprites)
        return console.warn(`Sprite data for key '${e}' not found.`), null;
      const s = i.sprites.find((r) => r.name === o);
      if (!s)
        return console.warn(
          `Sprite '${o}' not found in PSD data for key '${e}'.`
        ), null;
      const l = u(s);
      return t.textures.exists(o) ? this.placeLoadedSprite(t, l) : (console.warn(
        `Texture for sprite '${o}' not found. Attempting to load it now.`
      ), this.loadSprite(t, s, i.basePath, () => (console.log(`Texture for sprite '${o}' loaded.`), this.placeLoadedSprite(t, l))), null);
    },
    placeLoadedSprite(t, o, e = {}) {
      const { name: i, x: s, y: l, width: r, height: a } = o, d = t.add.image(s, l, i);
      r !== void 0 && a !== void 0 && d.setDisplaySize(r, a), d.setOrigin(0, 0);
      const c = o.addDebugVisualization(
        t,
        "sprite",
        n,
        e
      );
      return { layerData: o, image: d, debugGraphics: c };
    },
    countSprites(t) {
      return Array.isArray(t) ? t.length : 0;
    }
  };
}
function A(n) {
  return {
    load(t, o, e, i) {
      if (!o || !o.layers || o.layers.length === 0) {
        console.warn("No tiles to load or invalid tiles data");
        return;
      }
      o.layers.forEach((s) => {
        for (let l = 0; l < o.columns; l++)
          for (let r = 0; r < o.rows; r++) {
            const a = `${s.name}_tile_${l}_${r}`, d = `${e}/tiles/${o.tile_slice_size}/${a}.jpg`;
            t.load.image(a, d), t.load.once(`filecomplete-image-${a}`, i), n.options.debug && console.log(`Loading tile: ${a} from ${d}`);
          }
      });
    },
    create(t, o) {
    },
    countTiles(t) {
      return !t || !t.layers ? 0 : t.layers.length * t.columns * t.rows;
    },
    place(t, o, e) {
      const i = n.getData(e);
      if (!i || !i.tiles)
        return console.warn(`Tiles data for key '${e}' not found.`), null;
      const s = i.tiles;
      if (!s.layers.find((a) => a.name === o))
        return console.warn(`Tile layer '${o}' not found in PSD data for key '${e}'.`), null;
      const r = t.add.container(0, 0);
      for (let a = 0; a < s.columns; a++)
        for (let d = 0; d < s.rows; d++) {
          const c = `${o}_tile_${a}_${d}`, h = a * s.tile_slice_size, f = d * s.tile_slice_size;
          if (t.textures.exists(c)) {
            const p = t.add.image(h, f, c).setOrigin(0, 0);
            r.add(p), n.options.debug && console.log(`Placed tile: ${c} at (${h}, ${f})`);
          } else
            console.warn(`Texture for tile ${c} not found`);
        }
      return r;
    }
  };
}
function L(n) {
  return {
    place(t, o, e, i = {}) {
      const s = n.getData(e);
      if (!s || !s.zones)
        return console.warn(`Zone data for key '${e}' not found.`), null;
      const l = s.zones.find((P) => P.name === o);
      if (!l)
        return console.warn(
          `Zone '${o}' not found in PSD data for key '${e}'.`
        ), null;
      const r = u(l);
      let a;
      const { left: d, top: c, right: h, bottom: f } = r.bbox, p = h - d, b = f - c;
      a = t.add.zone(d, c, p, b), (!t.physics || !t.physics.world) && t.physics.startSystem(Phaser.Physics.ARCADE), t.physics.add.existing(a, !0);
      const y = r.addDebugVisualization(
        t,
        "zone",
        n,
        i
      );
      return n.options.debug && console.log(
        `Placed zone: ${o} at (${d}, ${c}) with dimensions ${p}x${b}`
      ), { layerData: r, zoneObject: a, debugGraphics: y };
    },
    countZones(t) {
      return Array.isArray(t) ? t.length : 0;
    }
  };
}
class T extends Phaser.Plugins.BasePlugin {
  constructor(t) {
    super(t), this.psdData = {}, this.options = { debug: !1 };
  }
  boot() {
    this.pluginManager.game.events.once("destroy", this.destroy, this);
  }
  init(t = {}) {
    this.options = { ...this.options, ...t }, this.data = S(this), this.points = x(this), this.sprites = z(this), this.tiles = A(this), this.zones = L(this), this.options.debug && console.log("PsdToJSONPlugin initialized with options:", this.options);
  }
  load(t, o, e) {
    this.data.load(t, o, e);
  }
  getData(t) {
    return this.psdData[t];
  }
}
export {
  T as default
};
