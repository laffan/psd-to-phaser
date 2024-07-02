var P = Object.defineProperty;
var w = (l, t, e) => t in l ? P(l, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[t] = e;
var $ = (l, t, e) => (w(l, typeof t != "symbol" ? t + "" : t, e), e);
const f = class f {
  constructor(t, e = null) {
    this.parent = e, this.children = [], this.lazyLoad = !1, this.isLoaded = !1, Object.keys(t).forEach((n) => {
      n === "children" ? this.children = t[n].map((o) => new f(o, this)) : this[n] = t[n];
    });
  }
  isStandardProp(t) {
    return f.standardProps.includes(t);
  }
  getCustomAttributes() {
    return Object.keys(this).filter((t) => !this.isStandardProp(t) && t !== "parent").reduce((t, e) => (t[e] = this[e], t), {});
  }
  addDebugVisualization(t, e, n, o = {}) {
    if (!this.shouldDebug(n, o))
      return null;
    let s = "0xFF00FF", r;
    switch (e) {
      case "sprite":
        r = t.add.rectangle(this.x, this.y, this.width, this.height, s, 0.5), r.setOrigin(0, 0);
        break;
      case "zone":
        const { left: a, top: i, right: d, bottom: c } = this.bbox, u = d - a, h = c - i;
        r = t.add.rectangle(a, i, u, h, s, 0.5), r.setOrigin(0, 0);
        break;
      case "point":
        r = t.add.circle(this.x, this.y, 10, s, 0.5);
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
      const n = e[1], o = this.children.find((s) => s.name === n);
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
function y(l) {
  let t = 0, e = !1, n = [];
  return {
    load(o, s, r) {
      const a = `${r}/data.json`;
      o.load.json(s, a), o.load.once("complete", () => {
        const i = o.cache.json.get(s);
        this.processJSON(o, s, i, r);
      });
    },
    processJSON(o, s, r, a) {
      l.psdData[s] = {
        ...r,
        basePath: a,
        sprites: r.sprites.map((i) => g(i)),
        zones: r.zones.map((i) => g(i)),
        points: r.points.map((i) => g(i))
      }, l.options.debug && console.log(`Loaded JSON for key "${s}":`, l.psdData[s]), this.loadAssetsFromJSON(o, s, l.psdData[s]);
    },
    loadAssetsFromJSON(o, s, r) {
      const a = this.flattenObjects(r.sprites), i = r.tiles || {};
      let d = this.countAssets(a) + l.tiles.countTiles(i), c = 0;
      l.options.debug && console.log(`Total assets to load: ${d}`);
      const u = () => {
        c++, t = c / d, o.events.emit("psdAssetsLoadProgress", t), l.options.debug && (console.log(`Loaded asset ${c} of ${d}`), console.log(`Loading progress: ${(t * 100).toFixed(2)}%`)), c === d && (e = !0, o.events.emit("psdAssetsLoadComplete"), l.options.debug && console.log("All PSD assets loaded"));
      };
      a.length > 0 && this.loadSprites(o, a, r.basePath, u), i.layers && i.layers.length > 0 && l.tiles.load(o, i, r.basePath, u), d === 0 && (e = !0, o.events.emit("psdAssetsLoadComplete")), o.load.isLoading() || o.load.start();
    },
    flattenObjects(o, s = "") {
      return o.reduce((r, a) => {
        const i = s ? `${s}/${a.name}` : a.name;
        return a.lazyLoad ? n.push({ path: i, obj: a }) : (!a.children || a.children.length === 0) && r.push({ path: i, obj: a }), a.children && r.push(...this.flattenObjects(a.children, i)), r;
      }, []);
    },
    loadSprites(o, s, r, a) {
      s.forEach(({ path: i, obj: d }) => {
        const c = `${r}/sprites/${i}.png`;
        o.load.image(i, c), o.load.once(`filecomplete-image-${i}`, () => {
          d.isLoaded = !0, a();
        }), l.options.debug && console.log(`Loading sprite: ${i} from ${c}`);
      });
    },
    countAssets(o) {
      return o.length;
    },
    getLazyLoadQueue() {
      return n;
    },
    get progress() {
      return t;
    },
    get complete() {
      return e;
    }
  };
}
function b(l) {
  return {
    place(t, e, n, o = {}) {
      const s = l.getData(n);
      if (!s || !s.points)
        return console.warn(`Point data for key '${n}' not found.`), null;
      const r = s.points.find(
        (i) => e.startsWith(i.name)
      );
      if (!r)
        return console.warn(
          `Point '${e}' not found in PSD data for key '${n}'.`
        ), null;
      const a = r.findByPath(e);
      return a ? this.placePoint(t, a, o) : (console.warn(
        `Point '${e}' not found in PSD data for key '${n}'.`
      ), null);
    },
    placePoint(t, e, n = {}) {
      const { name: o, x: s, y: r } = e, a = t.add.rectangle(s, r, 1, 1, 16777215, 0), i = e.addDebugVisualization(
        t,
        "point",
        l,
        n
      );
      l.options.debug && console.log(`Placed point: ${o} at (${s}, ${r})`);
      const d = { layerData: e, pointObject: a, debugGraphics: i };
      return e.children && (d.children = e.children.map(
        (c) => this.placePoint(t, c, n)
      )), d;
    },
    placeAll(t, e, n = {}) {
      const o = l.getData(e);
      return !o || !o.points ? (console.warn(`Point data for key '${e}' not found.`), null) : o.points.map(
        (s) => this.placePoint(t, s, n)
      );
    },
    countPoints(t) {
      return this.countPointsRecursive(t);
    },
    countPointsRecursive(t) {
      return t.reduce((e, n) => {
        let o = 1;
        return n.children && (o += this.countPointsRecursive(n.children)), e + o;
      }, 0);
    }
  };
}
function D(l) {
  return {
    place(t, e, n, o = {}) {
      const s = l.getData(n);
      if (!s || !s.sprites)
        return console.warn(`Sprite data for key '${n}' not found.`), null;
      const r = s.sprites.find(
        (i) => e.startsWith(i.name)
      );
      if (!r)
        return console.warn(
          `Sprite '${e}' not found in PSD data for key '${n}'.`
        ), null;
      const a = r.findByPath(e);
      return a ? this.placeSprite(t, a, o) : (console.warn(
        `Sprite '${e}' not found in PSD data for key '${n}'.`
      ), null);
    },
    placeSprite(t, e, n = {}) {
      const { name: o, x: s, y: r, width: a, height: i } = e;
      let d = null;
      (!e.children || e.children.length === 0) && (e.lazyLoad && !e.isLoaded ? console.warn(
        `Sprite '${e.getPath()}' is set to lazy load and hasn't been loaded yet.`
      ) : (d = t.add.image(s, r, e.getPath()), a !== void 0 && i !== void 0 && d.setDisplaySize(a, i), d.setOrigin(0, 0)));
      const c = e.addDebugVisualization(
        t,
        "sprite",
        l,
        n
      );
      l.options.debug && console.log(
        `Placed sprite: ${o} at (${s}, ${r}) with dimensions ${a}x${i}`
      );
      const u = { layerData: e, image: d, debugGraphics: c };
      return e.children && (u.children = e.children.map(
        (h) => this.placeSprite(t, h, n)
      )), u;
    },
    placeAll(t, e, n = {}) {
      const o = l.getData(e);
      return !o || !o.sprites ? (console.warn(`Sprite data for key '${e}' not found.`), null) : o.sprites.map(
        (s) => this.placeSprite(t, s, n)
      );
    },
    countSprites(t) {
      return this.countSpritesRecursive(t);
    },
    countSpritesRecursive(t) {
      return t.reduce((e, n) => {
        let o = 1;
        return n.children && (o += this.countSpritesRecursive(n.children)), e + o;
      }, 0);
    }
  };
}
function S(l) {
  return {
    load(t, e, n, o) {
      if (!e || !e.layers || e.layers.length === 0) {
        console.warn("No tiles to load or invalid tiles data");
        return;
      }
      e.layers.forEach((s) => {
        for (let r = 0; r < e.columns; r++)
          for (let a = 0; a < e.rows; a++) {
            const i = `${s.name}_tile_${r}_${a}`, d = `${n}/tiles/${e.tile_slice_size}/${i}.jpg`;
            t.load.image(i, d), t.load.once(`filecomplete-image-${i}`, o), l.options.debug && console.log(`Loading tile: ${i} from ${d}`);
          }
      });
    },
    create(t, e) {
    },
    countTiles(t) {
      return !t || !t.layers ? 0 : t.layers.length * t.columns * t.rows;
    },
    place(t, e, n) {
      const o = l.getData(n);
      if (!o || !o.tiles)
        return console.warn(`Tiles data for key '${n}' not found.`), null;
      const s = o.tiles;
      if (!s.layers.find((i) => i.name === e))
        return console.warn(`Tile layer '${e}' not found in PSD data for key '${n}'.`), null;
      const a = t.add.container(0, 0);
      for (let i = 0; i < s.columns; i++)
        for (let d = 0; d < s.rows; d++) {
          const c = `${e}_tile_${i}_${d}`, u = i * s.tile_slice_size, h = d * s.tile_slice_size;
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
function z(l) {
  return {
    place(t, e, n, o = {}) {
      const s = l.getData(n);
      if (!s || !s.zones)
        return console.warn(`Zone data for key '${n}' not found.`), null;
      const r = s.zones.find((i) => e.startsWith(i.name));
      if (!r)
        return console.warn(
          `Zone '${e}' not found in PSD data for key '${n}'.`
        ), null;
      const a = r.findByPath(e);
      return a ? this.placeZone(t, a, o) : (console.warn(
        `Zone '${e}' not found in PSD data for key '${n}'.`
      ), null);
    },
    placeZone(t, e, n = {}) {
      const { name: o, x: s, y: r, width: a, height: i } = e, d = t.add.zone(s, r, a, i);
      (!t.physics || !t.physics.world) && t.physics.startSystem(Phaser.Physics.ARCADE), t.physics.add.existing(d, !0);
      const c = e.addDebugVisualization(
        t,
        "zone",
        l,
        n
      );
      l.options.debug && console.log(
        `Placed zone: ${o} at (${s}, ${r}) with dimensions ${a}x${i}`
      );
      const u = { layerData: e, zoneObject: d, debugGraphics: c };
      return e.children && (u.children = e.children.map(
        (h) => this.placeZone(t, h, n)
      )), u;
    },
    placeAll(t, e, n = {}) {
      const o = l.getData(e);
      return !o || !o.zones ? (console.warn(`Zone data for key '${e}' not found.`), null) : o.zones.map(
        (s) => this.placeZone(t, s, n)
      );
    },
    countZones(t) {
      return this.countZonesRecursive(t);
    },
    countZonesRecursive(t) {
      return t.reduce((e, n) => {
        let o = 1;
        return n.children && (o += this.countZonesRecursive(n.children)), e + o;
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
    this.options = { ...this.options, ...t }, this.data = y(this), this.points = b(this), this.sprites = D(this), this.tiles = S(this), this.zones = z(this), this.options.debug && console.log("PsdToJSONPlugin initialized with options:", this.options);
  }
  load(t, e, n) {
    this.data.load(t, e, n);
  }
  getData(t) {
    return this.psdData[t];
  }
}
export {
  x as default
};
