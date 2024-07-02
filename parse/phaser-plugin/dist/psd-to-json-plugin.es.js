var w = Object.defineProperty;
var z = (l, e, t) => e in l ? w(l, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : l[e] = t;
var b = (l, e, t) => (z(l, typeof e != "symbol" ? e + "" : e, t), t);
const g = class g {
  constructor(e, t = null) {
    this.parent = t, this.children = [], this.lazyLoad = !1, this.isLoaded = !1, Object.keys(e).forEach((s) => {
      s === "children" ? this.children = e[s].map(
        (n) => new g(n, this)
      ) : this[s] = e[s];
    }), this.bbox || (this.bbox = {
      left: this.x,
      top: this.y,
      right: this.x + this.width,
      bottom: this.y + this.height
    });
  }
  isStandardProp(e) {
    return g.standardProps.includes(e);
  }
  getCustomAttributes() {
    return Object.keys(this).filter((e) => !this.isStandardProp(e) && e !== "parent").reduce((e, t) => (e[t] = this[t], e), {});
  }
  createDebugBox(e, t, s, n = {}) {
    if (!this.shouldDebug(s, n))
      return null;
    let o, a = 16711935;
    if (t === "zone") {
      const { left: i, top: r, right: c, bottom: d } = this.bbox, u = c - i, f = d - r;
      o = e.add.rectangle(
        i,
        r,
        u,
        f,
        a,
        0.5
      ), o.setOrigin(0, 0);
    } else
      t === "sprite" || t === "image" ? (o = e.add.rectangle(
        this.x,
        this.y,
        this.width,
        this.height,
        a,
        0.5
      ), o.setOrigin(0, 0)) : t === "point" && (o = e.add.circle(this.x, this.y, 5, a, 0.5));
    return o;
  }
  getTargetObject(e, t) {
    switch (t) {
      case "sprite":
        return e.children.getByName(this.name);
      case "zone":
        return e.children.getByName(this.name);
      case "point":
        return e.children.getByName(this.name);
      default:
        return null;
    }
  }
  shouldDebug(e, t) {
    return e.options.debug || t.debug;
  }
  getPath() {
    return this.parent ? `${this.parent.getPath()}/${this.name}` : this.name;
  }
  findByPath(e) {
    const t = e.split("/");
    if (t[0] === this.name) {
      if (t.length === 1)
        return this;
      const s = t[1], n = this.children.find((o) => o.name === s);
      return n ? n.findByPath(t.slice(1).join("/")) : null;
    }
    return null;
  }
  static place(e, t, s, n, o, a = {}) {
    if (!t || !t[s])
      return console.warn(`${s} data not found.`), null;
    let i;
    if (s === "tiles")
      i = t[s].layers.find((c) => c.name === n);
    else {
      const c = n.split("/");
      i = t[s].find((d) => d.name === c[0]);
      for (let d = 1; d < c.length; d++) {
        if (!i || !i.children)
          return null;
        i = i.children.find(
          (u) => u.name === c[d]
        );
      }
    }
    if (!i)
      return console.warn(`${s} '${n}' not found in PSD data.`), null;
    const r = o(e, i, a);
    return r && (t[`placed${s.charAt(0).toUpperCase() + s.slice(1)}`] || (t[`placed${s.charAt(0).toUpperCase() + s.slice(1)}`] = {}), t[`placed${s.charAt(0).toUpperCase() + s.slice(1)}`][n] = r, r.children && this.storeNestedObjects(t, s, n, r.children)), r;
  }
  static storeNestedObjects(e, t, s, n) {
    n.forEach((o) => {
      const a = `${s}/${o.layerData.name}`;
      e[`placed${t.charAt(0).toUpperCase() + t.slice(1)}`][a] = o, o.children && this.storeNestedObjects(e, t, a, o.children);
    });
  }
  static placeAll(e, t, s, n, o = {}) {
    if (!t || !t[s])
      return console.warn(`${s} data not found.`), null;
    const a = t[s].map(
      (i) => n(e, i, o)
    );
    return t[`placed${s.charAt(0).toUpperCase() + s.slice(1)}`] = a, a;
  }
  static get(e, t, s) {
    const n = `placed${t.charAt(0).toUpperCase() + t.slice(1)}`;
    if (!e || !e[n])
      return console.warn(`Placed ${t} data not found.`), null;
    const o = s.split("/");
    let a = e[n].find(
      (i) => i.layerData.name === o[0]
    );
    for (let i = 1; i < o.length; i++) {
      if (!a || !a.children)
        return null;
      a = a.children.find(
        (r) => r.layerData.name === o[i]
      );
    }
    return a;
  }
  static countRecursive(e) {
    return e.reduce((t, s) => {
      let n = 1;
      return s.children && s.children.length > 0 && (n += this.countRecursive(s.children)), t + n;
    }, 0);
  }
};
b(g, "standardProps", [
  "name",
  "x",
  "y",
  "width",
  "height",
  "children",
  "lazyLoad"
]);
let h = g;
function $(l) {
  return new h(l);
}
function D(l) {
  let e = 0, t = !1, s = [];
  return {
    load(n, o, a) {
      const i = `${a}/data.json`;
      n.load.json(o, i), n.load.once("complete", () => {
        const r = n.cache.json.get(o);
        this.processJSON(n, o, r, a);
      });
    },
    processJSON(n, o, a, i) {
      l.psdData[o] = {
        ...a,
        basePath: i,
        sprites: a.sprites.map((r) => $(r)),
        zones: a.zones.map((r) => $(r)),
        points: a.points.map((r) => $(r))
      }, l.options.debug && console.log(`Loaded JSON for key "${o}":`, l.psdData[o]), this.loadAssetsFromJSON(n, o, l.psdData[o]);
    },
    loadAssetsFromJSON(n, o, a) {
      const i = this.flattenObjects(a.sprites), r = a.tiles || {};
      let c = this.countAssets(i) + l.tiles.countTiles(r), d = 0;
      l.options.debug && console.log(`Total assets to load: ${c}`);
      const u = () => {
        d++, e = d / c, n.events.emit("psdAssetsLoadProgress", e), l.options.debug && (console.log(`Loaded asset ${d} of ${c}`), console.log(`Loading progress: ${(e * 100).toFixed(2)}%`)), d === c && (t = !0, n.events.emit("psdAssetsLoadComplete"), l.options.debug && console.log("All PSD assets loaded"));
      };
      i.length > 0 && this.loadSprites(n, i, a.basePath, u), r.layers && r.layers.length > 0 && l.tiles.load(n, r, a.basePath, u), c === 0 && (t = !0, n.events.emit("psdAssetsLoadComplete")), n.load.isLoading() || n.load.start();
    },
    flattenObjects(n, o = "") {
      return n.reduce((a, i) => {
        const r = o ? `${o}/${i.name}` : i.name;
        return i.lazyLoad ? s.push({ path: r, obj: i }) : (!i.children || i.children.length === 0) && a.push({ path: r, obj: i }), i.children && a.push(...this.flattenObjects(i.children, r)), a;
      }, []);
    },
    loadSprites(n, o, a, i) {
      o.forEach(({ path: r, obj: c }) => {
        const d = `${a}/sprites/${r}.png`;
        n.load.image(r, d), n.load.once(`filecomplete-image-${r}`, () => {
          c.isLoaded = !0, i();
        }), l.options.debug && console.log(`Loading sprite: ${r} from ${d}`);
      });
    },
    countAssets(n) {
      return n.length;
    },
    getLazyLoadQueue() {
      return s;
    },
    get progress() {
      return e;
    },
    get complete() {
      return t;
    }
  };
}
function x(l) {
  return {
    place(e, t, s, n = {}) {
      const o = l.getData(s);
      return !o || !o.points ? (console.warn(`Point data for key '${s}' not found.`), null) : h.place(
        e,
        o,
        "points",
        t,
        this.placePoint.bind(this),
        n
      );
    },
    placePoint(e, t, s = {}) {
      const { name: n, x: o, y: a } = t, i = e.add.circle(o, a, 5, 16777215, 1);
      i.setName(n);
      const r = t.createDebugBox(
        e,
        "point",
        l,
        s
      );
      l.options.debug && console.log(`Placed point: ${n} at (${o}, ${a})`);
      const c = { layerData: t, point: i, debugGraphics: r };
      return t.children && (c.children = t.children.map(
        (d) => this.placePoint(e, d, s)
      )), c;
    },
    placeAll(e, t, s = {}) {
      const n = l.getData(t);
      return !n || !n.points ? (console.warn(`Point data for key '${t}' not found.`), null) : n.points.map(
        (o) => h.place(
          e,
          n,
          "points",
          o.name,
          this.placePoint.bind(this),
          s
        )
      );
    },
    get(e, t) {
      const s = l.getData(e);
      return !s || !s.placedPoints ? (console.warn(`Placed point data for key '${e}' not found.`), null) : s.placedPoints[t] || null;
    },
    countPoints(e) {
      return h.countRecursive(e);
    }
  };
}
function S(l) {
  return {
    place(e, t, s, n = {}) {
      const o = l.getData(s);
      return !o || !o.sprites ? (console.warn(`Sprite data for key '${s}' not found.`), null) : h.place(
        e,
        o,
        "sprites",
        t,
        this.placeSprite.bind(this),
        n
      );
    },
    placeSprite(e, t, s = {}) {
      const { name: n, x: o, y: a, width: i, height: r } = t;
      let c = null;
      (!t.children || t.children.length === 0) && (t.lazyLoad && !t.isLoaded ? console.warn(
        `Sprite '${t.getPath()}' is set to lazy load and hasn't been loaded yet.`
      ) : (s.useImage ? c = e.add.image(o, a, t.getPath()) : c = e.add.sprite(o, a, t.getPath()), c.setName(n), i !== void 0 && r !== void 0 && c.setDisplaySize(i, r), c.setOrigin(0, 0)));
      const d = t.createDebugBox(e, "sprite", l, s);
      d && d.setPosition(o, a), l.options.debug && console.log(
        `Placed ${s.useImage ? "image" : "sprite"}: ${n} at (${o}, ${a}) with dimensions ${i}x${r}`
      );
      const u = {
        layerData: t,
        debugBox: d
      };
      if (c) {
        u[s.useImage ? "image" : "sprite"] = c, c.on("changeposition", () => {
          d && d.setPosition(c.x, c.y);
        });
        const f = c.setPosition;
        c.setPosition = function(m, p) {
          f.call(this, m, p), this.emit("changeposition");
        };
      }
      return t.children && (u.children = t.children.map(
        (f) => this.placeSprite(e, f, s)
      )), u;
    },
    placeAll(e, t, s = {}) {
      const n = l.getData(t);
      return !n || !n.sprites ? (console.warn(`Sprite data for key '${t}' not found.`), null) : n.sprites.map(
        (o) => h.place(
          e,
          n,
          "sprites",
          o.name,
          this.placeSprite.bind(this),
          s
        )
      );
    },
    get(e, t) {
      const s = l.getData(e);
      return !s || !s.placedSprites ? (console.warn(`Placed sprite data for key '${e}' not found.`), null) : s.placedSprites[t] || null;
    },
    countSprites(e) {
      return h.countRecursive(e);
    }
  };
}
function L(l) {
  return {
    load(e, t, s, n) {
      if (!t || !t.layers || t.layers.length === 0) {
        console.warn("No tiles to load or invalid tiles data");
        return;
      }
      t.layers.forEach((o) => {
        for (let a = 0; a < t.columns; a++)
          for (let i = 0; i < t.rows; i++) {
            const r = `${o.name}_tile_${a}_${i}`, c = `${s}/tiles/${t.tile_slice_size}/${r}.jpg`;
            e.load.image(r, c), e.load.once(`filecomplete-image-${r}`, n), l.options.debug && console.log(`Loading tile: ${r} from ${c}`);
          }
      });
    },
    countTiles(e) {
      return !e || !e.layers ? 0 : e.layers.length * e.columns * e.rows;
    },
    place(e, t, s, n = {}) {
      const o = l.getData(s);
      return !o || !o.tiles ? (console.warn(`Tiles data for key '${s}' not found.`), null) : h.place(
        e,
        o,
        "tiles",
        t,
        this.placeTileLayer.bind(this),
        { ...n, psdKey: s, tilesData: o.tiles }
      );
    },
    placeTileLayer(e, t, s) {
      const { tilesData: n } = s, o = e.add.container(0, 0);
      o.setName(t.name);
      for (let i = 0; i < n.columns; i++)
        for (let r = 0; r < n.rows; r++) {
          const c = `${t.name}_tile_${i}_${r}`, d = i * n.tile_slice_size, u = r * n.tile_slice_size;
          if (e.textures.exists(c)) {
            const f = e.add.image(d, u, c).setOrigin(0, 0);
            o.add(f), l.options.debug && console.log(`Placed tile: ${c} at (${d}, ${u})`);
          } else
            console.warn(`Texture for tile ${c} not found`);
        }
      const a = this.addDebugVisualization(
        e,
        t,
        n,
        s
      );
      return a && o.add(a), { layerData: t, tileLayer: o, debugGraphics: a };
    },
    placeAll(e, t, s = {}) {
      const n = l.getData(t);
      return !n || !n.tiles || !n.tiles.layers ? (console.warn(`Tiles data for key '${t}' not found.`), null) : n.tiles.layers.map(
        (o) => this.place(e, o.name, t, s)
      );
    },
    get(e, t) {
      const s = l.getData(e);
      return !s || !s.placedTiles ? (console.warn(`Placed tile layer data for key '${e}' not found.`), null) : s.placedTiles[t] || null;
    },
    addDebugVisualization(e, t, s, n) {
      if (!n.debug && !l.options.debug)
        return null;
      const o = e.add.graphics();
      o.lineStyle(2, 16711935, 1);
      const a = s.columns * s.tile_slice_size, i = s.rows * s.tile_slice_size;
      return o.strokeRect(0, 0, a, i), o;
    }
  };
}
function O(l) {
  return {
    place(e, t, s, n = {}) {
      const o = l.getData(s);
      return !o || !o.zones ? (console.warn(`Zone data for key '${s}' not found.`), null) : h.place(e, o, "zones", t, this.placeZone.bind(this), n);
    },
    placeZone(e, t, s = {}) {
      const { name: n, bbox: o } = t, { left: a, top: i, right: r, bottom: c } = o, d = r - a, u = c - i, f = e.add.zone(a, i, d, u);
      f.setName(n);
      const m = t.createDebugBox(e, "zone", l, s);
      l.options.debug && console.log(`Placed zone: ${n} at (${a}, ${i}) with dimensions ${d}x${u}`);
      const p = { layerData: t, zone: f, debugGraphics: m };
      return t.children && (p.children = t.children.map((P) => this.placeZone(e, P, s))), p;
    },
    placeAll(e, t, s = {}) {
      const n = l.getData(t);
      return !n || !n.zones ? (console.warn(`Zone data for key '${t}' not found.`), null) : n.zones.map(
        (o) => h.place(e, n, "zones", o.name, this.placeZone.bind(this), s)
      );
    },
    get(e, t) {
      const s = l.getData(e);
      return !s || !s.placedZones ? (console.warn(`Placed zone data for key '${e}' not found.`), null) : s.placedZones[t] || null;
    },
    countZones(e) {
      return h.countRecursive(e);
    }
  };
}
class N extends Phaser.Plugins.BasePlugin {
  constructor(e) {
    super(e), this.psdData = {}, this.options = { debug: !1 };
  }
  boot() {
    this.pluginManager.game.events.once("destroy", this.destroy, this);
  }
  init(e = {}) {
    this.options = { ...this.options, ...e }, this.data = D(this), this.points = x(this), this.sprites = S(this), this.tiles = L(this), this.zones = O(this), this.options.debug && console.log("PsdToJSONPlugin initialized with options:", this.options);
  }
  load(e, t, s) {
    this.data.load(e, t, s);
  }
  getData(e) {
    return this.psdData[e];
  }
}
export {
  N as default
};
