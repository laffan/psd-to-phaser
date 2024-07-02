var w = Object.defineProperty;
var D = (l, t, e) => t in l ? w(l, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[t] = e;
var b = (l, t, e) => (D(l, typeof t != "symbol" ? t + "" : t, e), e);
const g = class g {
  constructor(t, e = null) {
    this.parent = e, this.children = [], this.lazyLoad = !1, this.isLoaded = !1, Object.keys(t).forEach((s) => {
      s === "children" ? this.children = t[s].map(
        (n) => new g(n, this)
      ) : this[s] = t[s];
    }), this.bbox || (this.bbox = {
      left: this.x,
      top: this.y,
      right: this.x + this.width,
      bottom: this.y + this.height
    });
  }
  isStandardProp(t) {
    return g.standardProps.includes(t);
  }
  getCustomAttributes() {
    return Object.keys(this).filter((t) => !this.isStandardProp(t) && t !== "parent").reduce((t, e) => (t[e] = this[e], t), {});
  }
  createDebugBox(t, e, s, n = {}) {
    if (!this.shouldDebug(s, n))
      return null;
    let o, a = 16711935;
    if (e === "zone") {
      const { left: i, top: r, right: c, bottom: d } = this.bbox, u = c - i, f = d - r;
      o = t.add.rectangle(
        i,
        r,
        u,
        f,
        a,
        0.5
      ), o.setOrigin(0, 0);
    } else
      e === "sprite" || e === "image" ? (o = t.add.rectangle(
        this.x,
        this.y,
        this.width,
        this.height,
        a,
        0.5
      ), o.setOrigin(0, 0)) : e === "point" && (o = t.add.circle(this.x, this.y, 5, a, 0.5));
    return o;
  }
  getTargetObject(t, e) {
    switch (e) {
      case "sprite":
        return t.children.getByName(this.name);
      case "zone":
        return t.children.getByName(this.name);
      case "point":
        return t.children.getByName(this.name);
      default:
        return null;
    }
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
      const s = e[1], n = this.children.find((o) => o.name === s);
      return n ? n.findByPath(e.slice(1).join("/")) : null;
    }
    return null;
  }
  static place(t, e, s, n, o, a = {}) {
    if (!e || !e[s])
      return console.warn(`${s} data not found.`), null;
    let i;
    if (s === "tiles")
      i = e[s].layers.find((c) => c.name === n);
    else {
      const c = n.split("/");
      i = e[s].find((d) => d.name === c[0]);
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
    const r = o(t, i, a);
    return r && (e[`placed${s.charAt(0).toUpperCase() + s.slice(1)}`] || (e[`placed${s.charAt(0).toUpperCase() + s.slice(1)}`] = {}), e[`placed${s.charAt(0).toUpperCase() + s.slice(1)}`][n] = r, r.children && this.storeNestedObjects(e, s, n, r.children)), r;
  }
  static storeNestedObjects(t, e, s, n) {
    n.forEach((o) => {
      const a = `${s}/${o.layerData.name}`;
      t[`placed${e.charAt(0).toUpperCase() + e.slice(1)}`][a] = o, o.children && this.storeNestedObjects(t, e, a, o.children);
    });
  }
  static placeAll(t, e, s, n, o = {}) {
    if (!e || !e[s])
      return console.warn(`${s} data not found.`), null;
    const a = e[s].map(
      (i) => n(t, i, o)
    );
    return e[`placed${s.charAt(0).toUpperCase() + s.slice(1)}`] = a, a;
  }
  static get(t, e, s) {
    const n = `placed${e.charAt(0).toUpperCase() + e.slice(1)}`;
    if (!t || !t[n])
      return console.warn(`Placed ${e} data not found.`), null;
    const o = s.split("/");
    let a = t[n].find(
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
  static countRecursive(t) {
    return t.reduce((e, s) => {
      let n = 1;
      return s.children && s.children.length > 0 && (n += this.countRecursive(s.children)), e + n;
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
function x(l) {
  let t = 0, e = !1, s = [];
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
        d++, t = d / c, n.events.emit("psdAssetsLoadProgress", t), l.options.debug && (console.log(`Loaded asset ${d} of ${c}`), console.log(`Loading progress: ${(t * 100).toFixed(2)}%`)), d === c && (e = !0, n.events.emit("psdAssetsLoadComplete"), l.options.debug && console.log("All PSD assets loaded"));
      };
      i.length > 0 && this.loadSprites(n, i, a.basePath, u), r.layers && r.layers.length > 0 && l.tiles.load(n, r, a.basePath, u), c === 0 && (e = !0, n.events.emit("psdAssetsLoadComplete")), n.load.isLoading() || n.load.start();
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
      return t;
    },
    get complete() {
      return e;
    }
  };
}
function z(l) {
  return {
    place(t, e, s, n = {}) {
      const o = l.getData(s);
      return !o || !o.points ? (console.warn(`Point data for key '${s}' not found.`), null) : h.place(
        t,
        o,
        "points",
        e,
        this.placePoint.bind(this),
        n
      );
    },
    placePoint(t, e, s = {}) {
      const { name: n, x: o, y: a } = e, i = t.add.circle(o, a, 5, 16777215, 1);
      i.setName(n);
      const r = e.createDebugBox(
        t,
        "point",
        l,
        s
      );
      l.options.debug && console.log(`Placed point: ${n} at (${o}, ${a})`);
      const c = { layerData: e, point: i, debugGraphics: r };
      return e.children && (c.children = e.children.map(
        (d) => this.placePoint(t, d, s)
      )), c;
    },
    placeAll(t, e, s = {}) {
      const n = l.getData(e);
      return !n || !n.points ? (console.warn(`Point data for key '${e}' not found.`), null) : n.points.map(
        (o) => h.place(
          t,
          n,
          "points",
          o.name,
          this.placePoint.bind(this),
          s
        )
      );
    },
    get(t, e) {
      const s = l.getData(t);
      return !s || !s.placedPoints ? (console.warn(`Placed point data for key '${t}' not found.`), null) : s.placedPoints[e] || null;
    },
    countPoints(t) {
      return h.countRecursive(t);
    }
  };
}
function S(l) {
  return {
    place(t, e, s, n = {}) {
      const o = l.getData(s);
      return !o || !o.sprites ? (console.warn(`Sprite data for key '${s}' not found.`), null) : h.place(
        t,
        o,
        "sprites",
        e,
        this.placeSprite.bind(this),
        n
      );
    },
    placeSprite(t, e, s = {}) {
      const { name: n, x: o, y: a, width: i, height: r } = e;
      let c = null;
      (!e.children || e.children.length === 0) && (e.lazyLoad && !e.isLoaded ? console.warn(
        `Sprite '${e.getPath()}' is set to lazy load and hasn't been loaded yet.`
      ) : (s.useImage ? c = t.add.image(o, a, e.getPath()) : c = t.add.sprite(o, a, e.getPath()), c.setName(n), i !== void 0 && r !== void 0 && c.setDisplaySize(i, r), c.setOrigin(0, 0)));
      const d = e.createDebugBox(t, "sprite", l, s);
      d && d.setPosition(o, a), l.options.debug && console.log(
        `Placed ${s.useImage ? "image" : "sprite"}: ${n} at (${o}, ${a}) with dimensions ${i}x${r}`
      );
      const u = {
        layerData: e,
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
      return e.children && (u.children = e.children.map(
        (f) => this.placeSprite(t, f, s)
      )), u;
    },
    placeAll(t, e, s = {}) {
      const n = l.getData(e);
      return !n || !n.sprites ? (console.warn(`Sprite data for key '${e}' not found.`), null) : n.sprites.map(
        (o) => h.place(
          t,
          n,
          "sprites",
          o.name,
          this.placeSprite.bind(this),
          s
        )
      );
    },
    get(t, e) {
      const s = l.getData(t);
      return !s || !s.placedSprites ? (console.warn(`Placed sprite data for key '${t}' not found.`), null) : s.placedSprites[e] || null;
    },
    countSprites(t) {
      return h.countRecursive(t);
    }
  };
}
function A(l) {
  return {
    load(t, e, s, n) {
      if (!e || !e.layers || e.layers.length === 0) {
        console.warn("No tiles to load or invalid tiles data");
        return;
      }
      e.layers.forEach((o) => {
        for (let a = 0; a < e.columns; a++)
          for (let i = 0; i < e.rows; i++) {
            const r = `${o.name}_tile_${a}_${i}`, c = `${s}/tiles/${e.tile_slice_size}/${r}.jpg`;
            t.load.image(r, c), t.load.once(`filecomplete-image-${r}`, n), l.options.debug && console.log(`Loading tile: ${r} from ${c}`);
          }
      });
    },
    countTiles(t) {
      return !t || !t.layers ? 0 : t.layers.length * t.columns * t.rows;
    },
    place(t, e, s, n = {}) {
      const o = l.getData(s);
      return !o || !o.tiles ? (console.warn(`Tiles data for key '${s}' not found.`), null) : h.place(
        t,
        o,
        "tiles",
        e,
        this.placeTileLayer.bind(this),
        { ...n, psdKey: s, tilesData: o.tiles }
      );
    },
    placeTileLayer(t, e, s) {
      const { tilesData: n } = s, o = t.add.container(0, 0);
      o.setName(e.name);
      for (let i = 0; i < n.columns; i++)
        for (let r = 0; r < n.rows; r++) {
          const c = `${e.name}_tile_${i}_${r}`, d = i * n.tile_slice_size, u = r * n.tile_slice_size;
          if (t.textures.exists(c)) {
            const f = t.add.image(d, u, c).setOrigin(0, 0);
            o.add(f), l.options.debug && console.log(`Placed tile: ${c} at (${d}, ${u})`);
          } else
            console.warn(`Texture for tile ${c} not found`);
        }
      const a = this.addDebugVisualization(
        t,
        e,
        n,
        s
      );
      return a && o.add(a), { layerData: e, tileLayer: o, debugGraphics: a };
    },
    placeAll(t, e, s = {}) {
      const n = l.getData(e);
      return !n || !n.tiles || !n.tiles.layers ? (console.warn(`Tiles data for key '${e}' not found.`), null) : n.tiles.layers.map(
        (o) => this.place(t, o.name, e, s)
      );
    },
    get(t, e) {
      const s = l.getData(t);
      return !s || !s.placedTiles ? (console.warn(`Placed tile layer data for key '${t}' not found.`), null) : s.placedTiles[e] || null;
    },
    addDebugVisualization(t, e, s, n) {
      if (!n.debug && !l.options.debug)
        return null;
      const o = t.add.graphics();
      o.lineStyle(2, 16711935, 1);
      const a = s.columns * s.tile_slice_size, i = s.rows * s.tile_slice_size;
      return o.strokeRect(0, 0, a, i), o;
    }
  };
}
function L(l) {
  return {
    place(t, e, s, n = {}) {
      const o = l.getData(s);
      return !o || !o.zones ? (console.warn(`Zone data for key '${s}' not found.`), null) : h.place(
        t,
        o,
        "zones",
        e,
        this.placeZone.bind(this),
        n
      );
    },
    placeZone(t, e, s = {}) {
      const { name: n, bbox: o } = e, { left: a, top: i, right: r, bottom: c } = o, d = r - a, u = c - i, f = t.add.zone(a, i, d, u);
      f.setName(n), (!t.physics || !t.physics.world) && t.physics.startSystem(Phaser.Physics.ARCADE), t.physics.add.existing(f, !0);
      const m = e.createDebugBox(t, "zone", l, s);
      l.options.debug && console.log(
        `Placed zone: ${n} at (${a}, ${i}) with dimensions ${d}x${u}`
      );
      const p = { layerData: e, zone: f, debugGraphics: m };
      return e.children && (p.children = e.children.map(
        (P) => this.placeZone(t, P, s)
      )), p;
    },
    placeAll(t, e, s = {}) {
      const n = l.getData(e);
      return !n || !n.zones ? (console.warn(`Zone data for key '${e}' not found.`), null) : n.zones.map(
        (o) => h.place(
          t,
          n,
          "zones",
          o.name,
          this.placeZone.bind(this),
          s
        )
      );
    },
    get(t, e) {
      const s = l.getData(t);
      return !s || !s.placedZones ? (console.warn(`Placed zone data for key '${t}' not found.`), null) : s.placedZones[e] || null;
    },
    countZones(t) {
      return h.countRecursive(t);
    }
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
    this.options = { ...this.options, ...t }, this.data = x(this), this.points = z(this), this.sprites = S(this), this.tiles = A(this), this.zones = L(this), this.options.debug && console.log("PsdToJSONPlugin initialized with options:", this.options);
  }
  load(t, e, s) {
    this.data.load(t, e, s);
  }
  getData(t) {
    return this.psdData[t];
  }
}
export {
  y as default
};
