var P = Object.defineProperty;
var y = (l, t, e) => t in l ? P(l, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[t] = e;
var $ = (l, t, e) => (y(l, typeof t != "symbol" ? t + "" : t, e), e);
const f = class f {
  constructor(t, e = null) {
    this.parent = e, this.children = [], this.lazyLoad = !1, this.isLoaded = !1, Object.keys(t).forEach((s) => {
      s === "children" ? this.children = t[s].map((o) => new f(o, this)) : this[s] = t[s];
    });
  }
  isStandardProp(t) {
    return f.standardProps.includes(t);
  }
  getCustomAttributes() {
    return Object.keys(this).filter((t) => !this.isStandardProp(t) && t !== "parent").reduce((t, e) => (t[e] = this[e], t), {});
  }
  addDebugVisualization(t, e, s, o = {}) {
    if (!this.shouldDebug(s, o))
      return null;
    let i = "0xFF00FF", r;
    switch (e) {
      case "sprite":
        r = t.add.rectangle(this.x, this.y, this.width, this.height, i, 0.5), r.setOrigin(0, 0);
        break;
      case "zone":
        const { left: a, top: n, right: d, bottom: c } = this.bbox, u = d - a, h = c - n;
        r = t.add.rectangle(a, n, u, h, i, 0.5), r.setOrigin(0, 0);
        break;
      case "point":
        r = t.add.circle(this.x, this.y, 10, i, 0.5);
        break;
      default:
        console.warn(`Unknown debug visualization type: ${e}`);
    }
    return r;
  }
  shouldDebug(t, e) {
    return t.options.debug || e.debug;
  }
  getPath() {
    return this.parent ? `${this.parent.getPath()}/${this.name}` : this.name;
  }
  findByPath(t) {
    const e = t.split("/");
    if (e[0] === this.name) {
      if (e.length === 1)
        return this;
      const s = e[1], o = this.children.find((i) => i.name === s);
      return o ? o.findByPath(e.slice(1).join("/")) : null;
    }
    return null;
  }
};
$(f, "standardProps", ["name", "x", "y", "width", "height", "children", "lazyLoad"]);
let p = f;
function g(l) {
  return new p(l);
}
function b(l) {
  let t = 0, e = !1, s = [];
  return {
    load(o, i, r) {
      const a = `${r}/data.json`;
      o.load.json(i, a), o.load.once("complete", () => {
        const n = o.cache.json.get(i);
        this.processJSON(o, i, n, r);
      });
    },
    processJSON(o, i, r, a) {
      l.psdData[i] = {
        ...r,
        basePath: a,
        sprites: r.sprites.map((n) => g(n)),
        zones: r.zones.map((n) => g(n)),
        points: r.points.map((n) => g(n))
      }, l.options.debug && console.log(`Loaded JSON for key "${i}":`, l.psdData[i]), this.loadAssetsFromJSON(o, i, l.psdData[i]);
    },
    loadAssetsFromJSON(o, i, r) {
      const a = this.flattenObjects(r.sprites), n = r.tiles || {};
      let d = this.countAssets(a) + l.tiles.countTiles(n), c = 0;
      l.options.debug && console.log(`Total assets to load: ${d}`);
      const u = () => {
        c++, t = c / d, o.events.emit("psdAssetsLoadProgress", t), l.options.debug && (console.log(`Loaded asset ${c} of ${d}`), console.log(`Loading progress: ${(t * 100).toFixed(2)}%`)), c === d && (e = !0, o.events.emit("psdAssetsLoadComplete"), l.options.debug && console.log("All PSD assets loaded"));
      };
      a.length > 0 && this.loadSprites(o, a, r.basePath, u), n.layers && n.layers.length > 0 && l.tiles.load(o, n, r.basePath, u), d === 0 && (e = !0, o.events.emit("psdAssetsLoadComplete")), o.load.isLoading() || o.load.start();
    },
    flattenObjects(o, i = "") {
      return o.reduce((r, a) => {
        const n = i ? `${i}/${a.name}` : a.name;
        return a.lazyLoad ? s.push({ path: n, obj: a }) : (!a.children || a.children.length === 0) && r.push({ path: n, obj: a }), a.children && r.push(...this.flattenObjects(a.children, n)), r;
      }, []);
    },
    loadSprites(o, i, r, a) {
      i.forEach(({ path: n, obj: d }) => {
        const c = `${r}/sprites/${n}.png`;
        o.load.image(n, c), o.load.once(`filecomplete-image-${n}`, () => {
          d.isLoaded = !0, a();
        }), l.options.debug && console.log(`Loading sprite: ${n} from ${c}`);
      });
    },
    countAssets(o) {
      return o.length;
    },
    getLazyLoadQueue() {
      return s;
    },
    get progress() {
      return t;
    },
    get complete() {
      return e;
    }
  };
}
function w(l) {
  return {
    place(t, e, s, o = {}) {
      const i = l.getData(s);
      if (!i || !i.points)
        return console.warn(`Point data for key '${s}' not found.`), null;
      const r = i.points.find((n) => e.startsWith(n.name));
      if (!r)
        return console.warn(`Point '${e}' not found in PSD data for key '${s}'.`), null;
      const a = r.findByPath(e);
      return a ? this.placePoint(t, a, o) : (console.warn(`Point '${e}' not found in PSD data for key '${s}'.`), null);
    },
    placePoint(t, e, s = {}) {
      const { name: o, x: i, y: r } = e, a = t.add.rectangle(i, r, 1, 1, 16777215, 0), n = e.addDebugVisualization(t, "point", l, s);
      l.options.debug && console.log(`Placed point: ${o} at (${i}, ${r})`);
      const d = { layerData: e, pointObject: a, debugGraphics: n };
      return e.children && (d.children = e.children.map((c) => this.placePoint(t, c, s))), d;
    },
    countPoints(t) {
      return this.countPointsRecursive(t);
    },
    countPointsRecursive(t) {
      return t.reduce((e, s) => {
        let o = 1;
        return s.children && (o += this.countPointsRecursive(s.children)), e + o;
      }, 0);
    }
  };
}
function S(l) {
  return {
    place(t, e, s, o = {}) {
      const i = l.getData(s);
      if (!i || !i.sprites)
        return console.warn(`Sprite data for key '${s}' not found.`), null;
      const r = i.sprites.find(
        (n) => e.startsWith(n.name)
      );
      if (!r)
        return console.warn(
          `Sprite '${e}' not found in PSD data for key '${s}'.`
        ), null;
      const a = r.findByPath(e);
      return a ? this.placeSprite(t, a, o) : (console.warn(
        `Sprite '${e}' not found in PSD data for key '${s}'.`
      ), null);
    },
    placeSprite(t, e, s = {}) {
      const { name: o, x: i, y: r, width: a, height: n } = e;
      let d = null;
      (!e.children || e.children.length === 0) && (e.lazyLoad && !e.isLoaded ? console.warn(
        `Sprite '${e.getPath()}' is set to lazy load and hasn't been loaded yet.`
      ) : (d = t.add.image(i, r, e.getPath()), a !== void 0 && n !== void 0 && d.setDisplaySize(a, n), d.setOrigin(0, 0)));
      const c = e.addDebugVisualization(
        t,
        "sprite",
        l,
        s
      );
      l.options.debug && console.log(
        `Placed sprite: ${o} at (${i}, ${r}) with dimensions ${a}x${n}`
      );
      const u = { layerData: e, image: d, debugGraphics: c };
      return e.children && (u.children = e.children.map(
        (h) => this.placeSprite(t, h, s)
      )), u;
    },
    countSprites(t) {
      return this.countSpritesRecursive(t);
    },
    countSpritesRecursive(t) {
      return t.reduce((e, s) => {
        let o = 1;
        return s.children && (o += this.countSpritesRecursive(s.children)), e + o;
      }, 0);
    }
  };
}
function D(l) {
  return {
    load(t, e, s, o) {
      if (!e || !e.layers || e.layers.length === 0) {
        console.warn("No tiles to load or invalid tiles data");
        return;
      }
      e.layers.forEach((i) => {
        for (let r = 0; r < e.columns; r++)
          for (let a = 0; a < e.rows; a++) {
            const n = `${i.name}_tile_${r}_${a}`, d = `${s}/tiles/${e.tile_slice_size}/${n}.jpg`;
            t.load.image(n, d), t.load.once(`filecomplete-image-${n}`, o), l.options.debug && console.log(`Loading tile: ${n} from ${d}`);
          }
      });
    },
    create(t, e) {
    },
    countTiles(t) {
      return !t || !t.layers ? 0 : t.layers.length * t.columns * t.rows;
    },
    place(t, e, s) {
      const o = l.getData(s);
      if (!o || !o.tiles)
        return console.warn(`Tiles data for key '${s}' not found.`), null;
      const i = o.tiles;
      if (!i.layers.find((n) => n.name === e))
        return console.warn(`Tile layer '${e}' not found in PSD data for key '${s}'.`), null;
      const a = t.add.container(0, 0);
      for (let n = 0; n < i.columns; n++)
        for (let d = 0; d < i.rows; d++) {
          const c = `${e}_tile_${n}_${d}`, u = n * i.tile_slice_size, h = d * i.tile_slice_size;
          if (t.textures.exists(c)) {
            const m = t.add.image(u, h, c).setOrigin(0, 0);
            a.add(m), l.options.debug && console.log(`Placed tile: ${c} at (${u}, ${h})`);
          } else
            console.warn(`Texture for tile ${c} not found`);
        }
      return a;
    }
  };
}
function L(l) {
  return {
    place(t, e, s, o = {}) {
      const i = l.getData(s);
      if (!i || !i.zones)
        return console.warn(`Zone data for key '${s}' not found.`), null;
      const r = i.zones.find((n) => e.startsWith(n.name));
      if (!r)
        return console.warn(`Zone '${e}' not found in PSD data for key '${s}'.`), null;
      const a = r.findByPath(e);
      return a ? this.placeZone(t, a, o) : (console.warn(`Zone '${e}' not found in PSD data for key '${s}'.`), null);
    },
    placeZone(t, e, s = {}) {
      const { name: o, x: i, y: r, width: a, height: n } = e, d = t.add.zone(i, r, a, n);
      (!t.physics || !t.physics.world) && t.physics.startSystem(Phaser.Physics.ARCADE), t.physics.add.existing(d, !0);
      const c = e.addDebugVisualization(t, "zone", l, s);
      l.options.debug && console.log(`Placed zone: ${o} at (${i}, ${r}) with dimensions ${a}x${n}`);
      const u = { layerData: e, zoneObject: d, debugGraphics: c };
      return e.children && (u.children = e.children.map((h) => this.placeZone(t, h, s))), u;
    },
    countZones(t) {
      return this.countZonesRecursive(t);
    },
    countZonesRecursive(t) {
      return t.reduce((e, s) => {
        let o = 1;
        return s.children && (o += this.countZonesRecursive(s.children)), e + o;
      }, 0);
    }
  };
}
class x extends Phaser.Plugins.BasePlugin {
  constructor(t) {
    super(t), this.psdData = {}, this.options = { debug: !1 };
  }
  boot() {
    this.pluginManager.game.events.once("destroy", this.destroy, this);
  }
  init(t = {}) {
    this.options = { ...this.options, ...t }, this.data = b(this), this.points = w(this), this.sprites = S(this), this.tiles = D(this), this.zones = L(this), this.options.debug && console.log("PsdToJSONPlugin initialized with options:", this.options);
  }
  load(t, e, s) {
    this.data.load(t, e, s);
  }
  getData(t) {
    return this.psdData[t];
  }
}
export {
  x as default
};
