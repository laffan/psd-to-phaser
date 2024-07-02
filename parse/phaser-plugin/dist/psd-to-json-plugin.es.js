var w = Object.defineProperty;
var D = (l, t, e) => t in l ? w(l, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[t] = e;
var y = (l, t, e) => (D(l, typeof t != "symbol" ? t + "" : t, e), e);
const $ = class $ {
  constructor(t, e = null) {
    this.parent = e, this.children = [], this.lazyLoad = !1, this.isLoaded = !1, Object.keys(t).forEach((a) => {
      a === "children" ? this.children = t[a].map(
        (n) => new $(n, this)
      ) : this[a] = t[a];
    }), this.bbox || (this.bbox = {
      left: this.x,
      top: this.y,
      right: this.x + this.width,
      bottom: this.y + this.height
    });
  }
  isStandardProp(t) {
    return $.standardProps.includes(t);
  }
  getCustomAttributes() {
    return Object.keys(this).filter((t) => !this.isStandardProp(t) && t !== "parent").reduce((t, e) => (t[e] = this[e], t), {});
  }
  createDebugBox(t, e, a, n = {}) {
    if (!this.shouldDebug(a, n))
      return null;
    let s, o = 16711935;
    if (e === "zone") {
      const { left: i, top: r, right: c, bottom: d } = this.bbox, u = c - i, f = d - r;
      s = t.add.rectangle(
        i,
        r,
        u,
        f,
        o,
        0.5
      ), s.setOrigin(0, 0);
    } else
      e === "sprite" || e === "image" ? (s = t.add.rectangle(
        this.x,
        this.y,
        this.width,
        this.height,
        o,
        0.5
      ), s.setOrigin(0, 0)) : e === "point" && (s = t.add.circle(this.x, this.y, 5, o, 0.5));
    return s;
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
      const a = e[1], n = this.children.find((s) => s.name === a);
      return n ? n.findByPath(e.slice(1).join("/")) : null;
    }
    return null;
  }
  static place(t, e, a, n, s, o = {}) {
    if (!e || !e[a])
      return console.warn(`${a} data not found.`), null;
    let i;
    if (a === "tiles")
      i = e[a].layers.find((c) => c.name === n);
    else {
      const c = n.split("/");
      i = e[a].find((d) => d.name === c[0]);
      for (let d = 1; d < c.length; d++) {
        if (!i || !i.children)
          return null;
        i = i.children.find(
          (u) => u.name === c[d]
        );
      }
    }
    if (!i)
      return console.warn(`${a} '${n}' not found in PSD data.`), null;
    const r = s(t, i, o);
    return r && (e[`placed${a.charAt(0).toUpperCase() + a.slice(1)}`] || (e[`placed${a.charAt(0).toUpperCase() + a.slice(1)}`] = {}), e[`placed${a.charAt(0).toUpperCase() + a.slice(1)}`][n] = r, r.children && this.storeNestedObjects(e, a, n, r.children)), r;
  }
  static storeNestedObjects(t, e, a, n) {
    n.forEach((s) => {
      const o = `${a}/${s.layerData.name}`;
      t[`placed${e.charAt(0).toUpperCase() + e.slice(1)}`][o] = s, s.children && this.storeNestedObjects(t, e, o, s.children);
    });
  }
  static placeAll(t, e, a, n, s = {}) {
    if (!e || !e[a])
      return console.warn(`${a} data not found.`), null;
    const o = e[a].map(
      (i) => n(t, i, s)
    );
    return e[`placed${a.charAt(0).toUpperCase() + a.slice(1)}`] = o, o;
  }
  static get(t, e, a) {
    const n = `placed${e.charAt(0).toUpperCase() + e.slice(1)}`;
    if (!t || !t[n])
      return console.warn(`Placed ${e} data not found.`), null;
    const s = a.split("/");
    let o = t[n].find(
      (i) => i.layerData.name === s[0]
    );
    for (let i = 1; i < s.length; i++) {
      if (!o || !o.children)
        return null;
      o = o.children.find(
        (r) => r.layerData.name === s[i]
      );
    }
    return o;
  }
  static countRecursive(t) {
    return t.reduce((e, a) => {
      let n = 1;
      return a.children && a.children.length > 0 && (n += this.countRecursive(a.children)), e + n;
    }, 0);
  }
};
y($, "standardProps", [
  "name",
  "x",
  "y",
  "width",
  "height",
  "children",
  "lazyLoad"
]);
let p = $;
function P(l) {
  return new p(l);
}
function S(l) {
  let t = 0, e = !1, a = [];
  return {
    load(n, s, o) {
      const i = `${o}/data.json`;
      n.load.json(s, i), n.load.once("complete", () => {
        const r = n.cache.json.get(s);
        this.processJSON(n, s, r, o);
      });
    },
    processJSON(n, s, o, i) {
      l.psdData[s] = {
        ...o,
        basePath: i,
        sprites: o.sprites.map((r) => P(r)),
        zones: o.zones.map((r) => P(r)),
        points: o.points.map((r) => P(r))
      }, l.options.debug && console.log(`Loaded JSON for key "${s}":`, l.psdData[s]), this.loadAssetsFromJSON(n, s, l.psdData[s]);
    },
    loadAssetsFromJSON(n, s, o) {
      const i = this.flattenObjects(o.sprites), r = o.tiles || {};
      let c = this.countAssets(i) + l.tiles.countTiles(r), d = 0;
      l.options.debug && console.log(`Total assets to load: ${c}`);
      const u = () => {
        d++, t = d / c, n.events.emit("psdAssetsLoadProgress", t), l.options.debug && (console.log(`Loaded asset ${d} of ${c}`), console.log(`Loading progress: ${(t * 100).toFixed(2)}%`)), d === c && (e = !0, n.events.emit("psdAssetsLoadComplete"), l.options.debug && console.log("All PSD assets loaded"));
      };
      i.length > 0 && this.loadSprites(n, i, o.basePath, u), r.layers && r.layers.length > 0 && l.tiles.load(n, r, o.basePath, u), c === 0 && (e = !0, n.events.emit("psdAssetsLoadComplete")), n.load.isLoading() || n.load.start();
    },
    flattenObjects(n, s = "") {
      return n.reduce((o, i) => {
        const r = s ? `${s}/${i.name}` : i.name;
        return i.lazyLoad ? a.push({ path: r, obj: i }) : (!i.children || i.children.length === 0) && o.push({ path: r, obj: i }), i.children && o.push(...this.flattenObjects(i.children, r)), o;
      }, []);
    },
    loadSprites(n, s, o, i) {
      s.forEach(({ path: r, obj: c }) => {
        const d = `${o}/sprites/${r}.png`;
        c.type === "animation" ? n.load.spritesheet(r, d, {
          frameWidth: c.frame_width,
          frameHeight: c.frame_height
        }) : n.load.image(r, d), n.load.once(
          `filecomplete-${c.type === "animation" ? "spritesheet" : "image"}-${r}`,
          () => {
            c.isLoaded = !0, i();
          }
        ), l.options.debug && console.log(
          `Loading ${c.type === "animation" ? "spritesheet" : "sprite"}: ${r} from ${d}`
        );
      });
    },
    countAssets(n) {
      return n.length;
    },
    getLazyLoadQueue() {
      return a;
    },
    get progress() {
      return t;
    },
    get complete() {
      return e;
    }
  };
}
function x(l) {
  return {
    place(t, e, a, n = {}) {
      const s = l.getData(a);
      return !s || !s.points ? (console.warn(`Point data for key '${a}' not found.`), null) : p.place(
        t,
        s,
        "points",
        e,
        this.placePoint.bind(this),
        n
      );
    },
    placePoint(t, e, a = {}) {
      const { name: n, x: s, y: o } = e, i = t.add.circle(s, o, 5, 16777215, 1);
      i.setName(n);
      const r = e.createDebugBox(
        t,
        "point",
        l,
        a
      );
      l.options.debug && console.log(`Placed point: ${n} at (${s}, ${o})`);
      const c = { layerData: e, point: i, debugGraphics: r };
      return e.children && (c.children = e.children.map(
        (d) => this.placePoint(t, d, a)
      )), c;
    },
    placeAll(t, e, a = {}) {
      const n = l.getData(e);
      return !n || !n.points ? (console.warn(`Point data for key '${e}' not found.`), null) : n.points.map(
        (s) => p.place(
          t,
          n,
          "points",
          s.name,
          this.placePoint.bind(this),
          a
        )
      );
    },
    get(t, e) {
      const a = l.getData(t);
      return !a || !a.placedPoints ? (console.warn(`Placed point data for key '${t}' not found.`), null) : a.placedPoints[e] || null;
    },
    countPoints(t) {
      return p.countRecursive(t);
    }
  };
}
function O(l) {
  return {
    place(t, e, a, n = {}) {
      const s = l.getData(a);
      return !s || !s.sprites ? (console.warn(`Sprite data for key '${a}' not found.`), null) : p.place(
        t,
        s,
        "sprites",
        e,
        this.placeSprite.bind(this),
        n
      );
    },
    placeSprite(t, e, a = {}) {
      const { name: n, x: s, y: o, width: i, height: r, type: c } = e;
      let d = null, u = null;
      if (!e.children || e.children.length === 0)
        if (e.lazyLoad && !e.isLoaded)
          console.warn(
            `Sprite '${e.getPath()}' is set to lazy load and hasn't been loaded yet.`
          );
        else {
          if (c === "animation") {
            const h = this.createAnimatedSprite(
              t,
              e,
              a
            );
            d = h.sprite, u = h;
          } else
            d = a.useImage ? t.add.image(s, o, e.getPath()) : t.add.sprite(s, o, e.getPath());
          d.setName(n), i !== void 0 && r !== void 0 && d.setDisplaySize(i, r), d.setOrigin(0, 0);
        }
      const f = e.createDebugBox(t, "sprite", l, a);
      f && f.setPosition(s, o), l.options.debug && console.log(
        `Placed ${c === "animation" ? "animated sprite" : a.useImage ? "image" : "sprite"}: ${n} at (${s}, ${o}) with dimensions ${i}x${r}`
      );
      const m = {
        layerData: e,
        debugBox: f
      };
      if (d) {
        m[c === "animation" ? "sprite" : a.useImage ? "image" : "sprite"] = d, u && (m.animation = u.animation, m.animationKey = u.animationKey, m.play = u.play, m.pause = u.pause, m.resume = u.resume, m.stop = u.stop), d.on("changeposition", () => {
          f && f.setPosition(d.x, d.y);
        });
        const h = d.setPosition;
        d.setPosition = function(g, b) {
          h.call(this, g, b), this.emit("changeposition");
        };
      }
      return e.children && (m.children = e.children.map(
        (h) => this.placeSprite(t, h, a)
      )), m;
    },
    createAnimatedSprite(t, e, a = {}) {
      const { name: n, x: s, y: o, frame_count: i } = e, r = t.add.sprite(s, o, e.getPath()), c = [
        "frameRate",
        "duration",
        "delay",
        "repeat",
        "repeatDelay",
        "yoyo",
        "showOnStart",
        "hideOnComplete",
        "skipMissedFrames",
        "timeScale"
      ], d = {
        key: `${e.getPath()}_animated`,
        frames: t.anims.generateFrameNumbers(e.getPath(), {
          start: 0,
          end: i - 1
        }),
        frameRate: 10,
        repeat: -1,
        play: !0
      };
      c.forEach((h) => {
        e[h] !== void 0 && (d[h] = e[h]);
      });
      const u = {
        ...d,
        ...a.animationOptions
      }, f = t.anims.create(u);
      u.play && r.play(u.key);
      const m = (h) => (Object.entries(h).forEach(([g, b]) => {
        c.includes(g) && (f[g] = b);
      }), h.frames && (f.frames = t.anims.generateFrameNumbers(
        e.getPath(),
        h.frames
      )), h.paused !== void 0 && (h.paused ? r.anims.pause() : r.anims.resume()), r.anims.play(f), f);
      return {
        sprite: r,
        animation: f,
        animationKey: u.key,
        play: () => r.play(u.key),
        pause: () => r.anims.pause(),
        resume: () => r.anims.resume(),
        stop: () => r.anims.stop(),
        updateAnimation: m
      };
    },
    placeAll(t, e, a = {}) {
      const n = l.getData(e);
      return !n || !n.sprites ? (console.warn(`Sprite data for key '${e}' not found.`), null) : n.sprites.map(
        (s) => p.place(
          t,
          n,
          "sprites",
          s.name,
          this.placeSprite.bind(this),
          a
        )
      );
    },
    get(t, e) {
      const a = l.getData(t);
      if (!a || !a.placedSprites)
        return console.warn(`Placed sprite data for key '${t}' not found.`), null;
      const n = a.placedSprites[e];
      if (!n)
        return null;
      if (n.layerData.type === "animation") {
        const s = n.sprite, o = s.anims.currentAnim;
        return {
          sprite: s,
          animation: o,
          animationKey: o.key,
          play: () => s.play(o.key),
          pause: () => s.anims.pause(),
          resume: () => s.anims.resume(),
          stop: () => s.anims.stop(),
          updateAnimation: (i) => {
            const r = [
              "frameRate",
              "duration",
              "delay",
              "repeat",
              "repeatDelay",
              "yoyo",
              "showOnStart",
              "hideOnComplete",
              "skipMissedFrames",
              "timeScale"
            ];
            return Object.entries(i).forEach(([c, d]) => {
              r.includes(c) && (o[c] = d);
            }), i.frames && (o.frames = s.anims.generateFrameNames(
              s.texture.key,
              i.frames
            )), i.paused !== void 0 && (i.paused ? s.anims.pause() : s.anims.resume()), s.anims.play(o), o;
          }
        };
      }
      return n.sprite || n.image;
    },
    countSprites(t) {
      return p.countRecursive(t);
    }
  };
}
function z(l) {
  return {
    load(t, e, a, n) {
      if (!e || !e.layers || e.layers.length === 0) {
        console.warn("No tiles to load or invalid tiles data");
        return;
      }
      e.layers.forEach((s) => {
        for (let o = 0; o < e.columns; o++)
          for (let i = 0; i < e.rows; i++) {
            const r = `${s.name}_tile_${o}_${i}`, c = `${a}/tiles/${e.tile_slice_size}/${r}.jpg`;
            t.load.image(r, c), t.load.once(`filecomplete-image-${r}`, n), l.options.debug && console.log(`Loading tile: ${r} from ${c}`);
          }
      });
    },
    countTiles(t) {
      return !t || !t.layers ? 0 : t.layers.length * t.columns * t.rows;
    },
    place(t, e, a, n = {}) {
      const s = l.getData(a);
      return !s || !s.tiles ? (console.warn(`Tiles data for key '${a}' not found.`), null) : p.place(
        t,
        s,
        "tiles",
        e,
        this.placeTileLayer.bind(this),
        { ...n, psdKey: a, tilesData: s.tiles }
      );
    },
    placeTileLayer(t, e, a) {
      const { tilesData: n } = a, s = t.add.container(0, 0);
      s.setName(e.name);
      for (let i = 0; i < n.columns; i++)
        for (let r = 0; r < n.rows; r++) {
          const c = `${e.name}_tile_${i}_${r}`, d = i * n.tile_slice_size, u = r * n.tile_slice_size;
          if (t.textures.exists(c)) {
            const f = t.add.image(d, u, c).setOrigin(0, 0);
            s.add(f), l.options.debug && console.log(`Placed tile: ${c} at (${d}, ${u})`);
          } else
            console.warn(`Texture for tile ${c} not found`);
        }
      const o = this.addDebugVisualization(
        t,
        e,
        n,
        a
      );
      return o && s.add(o), { layerData: e, tileLayer: s, debugGraphics: o };
    },
    placeAll(t, e, a = {}) {
      const n = l.getData(e);
      return !n || !n.tiles || !n.tiles.layers ? (console.warn(`Tiles data for key '${e}' not found.`), null) : n.tiles.layers.map(
        (s) => this.place(t, s.name, e, a)
      );
    },
    get(t, e) {
      const a = l.getData(t);
      return !a || !a.placedTiles ? (console.warn(`Placed tile layer data for key '${t}' not found.`), null) : a.placedTiles[e] || null;
    },
    addDebugVisualization(t, e, a, n) {
      if (!n.debug && !l.options.debug)
        return null;
      const s = t.add.graphics();
      s.lineStyle(2, 16711935, 1);
      const o = a.columns * a.tile_slice_size, i = a.rows * a.tile_slice_size;
      return s.strokeRect(0, 0, o, i), s;
    }
  };
}
function A(l) {
  return {
    place(t, e, a, n = {}) {
      const s = l.getData(a);
      return !s || !s.zones ? (console.warn(`Zone data for key '${a}' not found.`), null) : p.place(t, s, "zones", e, this.placeZone.bind(this), n);
    },
    placeZone(t, e, a = {}) {
      const { name: n, bbox: s } = e, { left: o, top: i, right: r, bottom: c } = s, d = r - o, u = c - i, f = t.add.zone(o, i, d, u);
      f.setName(n);
      const m = e.createDebugBox(t, "zone", l, a);
      l.options.debug && console.log(`Placed zone: ${n} at (${o}, ${i}) with dimensions ${d}x${u}`);
      const h = { layerData: e, zone: f, debugGraphics: m };
      return e.children && (h.children = e.children.map((g) => this.placeZone(t, g, a))), h;
    },
    placeAll(t, e, a = {}) {
      const n = l.getData(e);
      return !n || !n.zones ? (console.warn(`Zone data for key '${e}' not found.`), null) : n.zones.map(
        (s) => p.place(t, n, "zones", s.name, this.placeZone.bind(this), a)
      );
    },
    get(t, e) {
      const a = l.getData(t);
      return !a || !a.placedZones ? (console.warn(`Placed zone data for key '${t}' not found.`), null) : a.placedZones[e] || null;
    },
    countZones(t) {
      return p.countRecursive(t);
    }
  };
}
class N extends Phaser.Plugins.BasePlugin {
  constructor(t) {
    super(t), this.psdData = {}, this.options = { debug: !1 };
  }
  boot() {
    this.pluginManager.game.events.once("destroy", this.destroy, this);
  }
  init(t = {}) {
    this.options = { ...this.options, ...t }, this.data = S(this), this.points = x(this), this.sprites = O(this), this.tiles = z(this), this.zones = A(this), this.options.debug && console.log("PsdToJSONPlugin initialized with options:", this.options);
  }
  load(t, e, a) {
    this.data.load(t, e, a);
  }
  getData(t) {
    return this.psdData[t];
  }
}
export {
  N as default
};
