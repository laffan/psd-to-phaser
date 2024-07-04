var x = Object.defineProperty;
var A = (c, t, e) => t in c ? x(c, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : c[t] = e;
var z = (c, t, e) => (A(c, typeof t != "symbol" ? t + "" : t, e), e);
const P = class P {
  constructor(t, e = null) {
    this.parent = e, this.children = [], this.lazyLoad = !1, this.isLoaded = !1, Object.keys(t).forEach((s) => {
      s === "children" ? this.children = t[s].map(
        (n) => new P(n, this)
      ) : this[s] = t[s];
    }), this.bbox || (this.bbox = {
      left: this.x,
      top: this.y,
      right: this.x + this.width,
      bottom: this.y + this.height
    });
  }
  isStandardProp(t) {
    return P.standardProps.includes(t);
  }
  getCustomAttributes() {
    return Object.keys(this).filter((t) => !this.isStandardProp(t) && t !== "parent").reduce((t, e) => (t[e] = this[e], t), {});
  }
  createDebugBox(t, e, s, n = {}) {
    if (!this.shouldDebug(s, n))
      return null;
    let i, o = 16711935;
    if (e === "zone") {
      const { left: a, top: r, right: l, bottom: d } = this.bbox, u = l - a, f = d - r;
      i = t.add.rectangle(
        a,
        r,
        u,
        f,
        o,
        0.5
      ), i.setOrigin(0, 0);
    } else
      e === "sprite" || e === "image" ? this.type === "spritesheet" ? (i = t.add.group(), this.placement.forEach((a) => {
        const r = t.add.rectangle(
          this.x + a.x,
          this.y + a.y,
          this.frame_width,
          this.frame_height,
          o,
          0.5
        );
        r.setOrigin(0, 0), i.add(r);
      })) : (i = t.add.rectangle(
        this.x,
        this.y,
        this.width,
        this.height,
        o,
        0.5
      ), i.setOrigin(0, 0)) : e === "point" && (i = t.add.circle(this.x, this.y, 5, o, 0.5));
    return i;
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
      const s = e[1], n = this.children.find((i) => i.name === s);
      return n ? n.findByPath(e.slice(1).join("/")) : null;
    }
    return null;
  }
  static place(t, e, s, n, i, o = {}) {
    if (!e || !e[s])
      return console.warn(`${s} data not found.`), null;
    let a;
    if (s === "tiles")
      a = e[s].layers.find((l) => l.name === n);
    else {
      const l = n.split("/");
      a = e[s].find((d) => d.name === l[0]);
      for (let d = 1; d < l.length; d++) {
        if (!a || !a.children)
          return null;
        a = a.children.find(
          (u) => u.name === l[d]
        );
      }
    }
    if (!a)
      return console.warn(`${s} '${n}' not found in PSD data.`), null;
    const r = i(t, a, o);
    return r && (e[`placed${s.charAt(0).toUpperCase() + s.slice(1)}`] || (e[`placed${s.charAt(0).toUpperCase() + s.slice(1)}`] = {}), e[`placed${s.charAt(0).toUpperCase() + s.slice(1)}`][n] = r, r.children && this.storeNestedObjects(e, s, n, r.children)), r;
  }
  static storeNestedObjects(t, e, s, n) {
    n.forEach((i) => {
      const o = `${s}/${i.layerData.name}`;
      t[`placed${e.charAt(0).toUpperCase() + e.slice(1)}`][o] = i, i.children && this.storeNestedObjects(t, e, o, i.children);
    });
  }
  static placeAll(t, e, s, n, i = {}) {
    if (!e || !e[s])
      return console.warn(`${s} data not found.`), null;
    const o = e[s].map(
      (a) => n(t, a, i)
    );
    return e[`placed${s.charAt(0).toUpperCase() + s.slice(1)}`] = o, o;
  }
  static get(t, e, s) {
    const n = `placed${e.charAt(0).toUpperCase() + e.slice(1)}`;
    if (!t || !t[n])
      return console.warn(`Placed ${e} data not found.`), null;
    const i = s.split("/");
    let o = t[n].find(
      (a) => a.layerData.name === i[0]
    );
    for (let a = 1; a < i.length; a++) {
      if (!o || !o.children)
        return null;
      o = o.children.find(
        (r) => r.layerData.name === i[a]
      );
    }
    return o;
  }
  static countRecursive(t) {
    return t.reduce((e, s) => {
      let n = 1;
      return s.children && s.children.length > 0 && (n += this.countRecursive(s.children)), e + n;
    }, 0);
  }
};
z(P, "standardProps", [
  "name",
  "x",
  "y",
  "width",
  "height",
  "children",
  "lazyLoad"
]);
let m = P;
function D(c) {
  return new m(c);
}
function _(c) {
  let t = 0, e = !1, s = [];
  return {
    load(n, i, o) {
      const a = `${o}/data.json`;
      n.load.json(i, a), n.load.once("complete", () => {
        const r = n.cache.json.get(i);
        this.processJSON(n, i, r, o);
      });
    },
    processJSON(n, i, o, a) {
      c.psdData[i] = {
        ...o,
        basePath: a,
        sprites: o.sprites.map((r) => D(r)),
        zones: o.zones.map((r) => D(r)),
        points: o.points.map((r) => D(r))
      }, c.options.debug && console.log(`Loaded JSON for key "${i}":`, c.psdData[i]), this.loadAssetsFromJSON(n, i, c.psdData[i]);
    },
    loadAssetsFromJSON(n, i, o) {
      const a = this.flattenObjects(o.sprites), r = o.tiles || {};
      let l = this.countAssets(a) + c.tiles.countTiles(r), d = 0;
      c.options.debug && console.log(`Total assets to load: ${l}`);
      const u = () => {
        d++, t = d / l, n.events.emit("psdAssetsLoadProgress", t), c.options.debug && (console.log(`Loaded asset ${d} of ${l}`), console.log(`Loading progress: ${(t * 100).toFixed(2)}%`)), d === l && (e = !0, n.events.emit("psdAssetsLoadComplete"), c.options.debug && console.log("All PSD assets loaded"));
      };
      a.length > 0 && this.loadSprites(n, a, o.basePath, u), r.layers && r.layers.length > 0 && c.tiles.load(n, r, o.basePath, u), l === 0 && (e = !0, n.events.emit("psdAssetsLoadComplete")), n.load.isLoading() || n.load.start();
    },
    flattenObjects(n, i = "") {
      return n.reduce((o, a) => {
        const r = i ? `${i}/${a.name}` : a.name;
        return a.lazyLoad ? s.push({ path: r, obj: a }) : (!a.children || a.children.length === 0) && o.push({ path: r, obj: a }), a.children && o.push(...this.flattenObjects(a.children, r)), o;
      }, []);
    },
    loadSprites(n, i, o, a) {
      i.forEach(({ path: r, obj: l }) => {
        if (l.lazyLoad) {
          c.options.debug && console.log(`Skipping load for lazy-loaded sprite: ${r}`);
          return;
        }
        const d = `${o}/sprites/${r}.png`;
        l.type === "animation" || l.type === "spritesheet" ? n.load.spritesheet(r, d, {
          frameWidth: l.frame_width,
          frameHeight: l.frame_height
        }) : n.load.image(r, d), n.load.once(
          `filecomplete-${l.type === "animation" || l.type === "spritesheet" ? "spritesheet" : "image"}-${r}`,
          () => {
            l.isLoaded = !0, a();
          }
        ), c.options.debug && console.log(
          `Loading ${l.type === "animation" ? "animation spritesheet" : l.type === "spritesheet" ? "spritesheet" : "sprite"}: ${r} from ${d}`
        );
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
function L(c) {
  return {
    place(t, e, s, n = {}) {
      const i = c.getData(s);
      return !i || !i.points ? (console.warn(`Point data for key '${s}' not found.`), null) : m.place(
        t,
        i,
        "points",
        e,
        this.placePoint.bind(this),
        n
      );
    },
    placePoint(t, e, s = {}) {
      const { name: n, x: i, y: o } = e, a = t.add.circle(i, o, 5, 16777215, 1);
      a.setName(n);
      const r = e.createDebugBox(
        t,
        "point",
        c,
        s
      );
      c.options.debug && console.log(`Placed point: ${n} at (${i}, ${o})`);
      const l = { layerData: e, point: a, debugGraphics: r };
      return e.children && (l.children = e.children.map(
        (d) => this.placePoint(t, d, s)
      )), l;
    },
    placeAll(t, e, s = {}) {
      const n = c.getData(e);
      return !n || !n.points ? (console.warn(`Point data for key '${e}' not found.`), null) : n.points.map(
        (i) => m.place(
          t,
          n,
          "points",
          i.name,
          this.placePoint.bind(this),
          s
        )
      );
    },
    get(t, e) {
      const s = c.getData(t);
      return !s || !s.placedPoints ? (console.warn(`Placed point data for key '${t}' not found.`), null) : s.placedPoints[e] || null;
    },
    countPoints(t) {
      return m.countRecursive(t);
    }
  };
}
function N(c) {
  return {
    place(t, e, s, n = {}) {
      const i = c.getData(s);
      return !i || !i.sprites ? (console.warn(`Sprite data for key '${s}' not found.`), null) : m.place(
        t,
        i,
        "sprites",
        e,
        this.placeSprite.bind(this),
        n
      );
    },
    placeSprite(t, e, s = {}) {
      const {
        name: n,
        x: i,
        y: o,
        width: a,
        height: r,
        type: l,
        frame_width: d,
        frame_height: u,
        placement: f,
        autoplacement: g = !0,
        lazyLoad: y
      } = e;
      let h = [], $ = null;
      if (!e.children || e.children.length === 0) {
        if (y)
          return c.options.debug && console.log(
            `Sprite '${e.getPath()}' is set to lazy load. Skipping placement.`
          ), { layerData: e, sprites: [], debugGraphics: null };
        if (!e.isLoaded)
          return console.warn(`Sprite '${e.getPath()}' hasn't been loaded yet.`), { layerData: e, sprites: [], debugGraphics: null };
        if (l === "animation") {
          const p = this.createAnimatedSprite(
            t,
            e,
            s
          );
          h.push(p.sprite), $ = p;
        } else if (l === "spritesheet" && g)
          f.forEach((p, O) => {
            const w = t.add.sprite(
              i + p.x,
              o + p.y,
              e.getPath(),
              p.frame
            );
            w.setName(`${n}_${O}`), w.setDisplaySize(d, u), w.setOrigin(0, 0), h.push(w);
          });
        else if (l !== "spritesheet" || g) {
          const p = s.useImage ? t.add.image(i, o, e.getPath()) : t.add.sprite(i, o, e.getPath());
          p.setName(n), a !== void 0 && r !== void 0 && p.setDisplaySize(a, r), p.setOrigin(0, 0), h.push(p);
        }
      }
      const S = g && !y ? e.createDebugBox(t, "sprite", c, s) : null;
      c.options.debug && g && !y && console.log(
        `Placed ${l === "spritesheet" ? "spritesheet" : l === "animation" ? "animated sprite" : s.useImage ? "image" : "sprite"}: ${n} at (${i}, ${o}) with dimensions ${d || a}x${u || r}`
      );
      const b = {
        layerData: e,
        sprites: h,
        debugGraphics: S
      };
      return $ && (b.animation = $.animation, b.animationKey = $.animationKey, b.play = $.play, b.pause = $.pause, b.resume = $.resume, b.stop = $.stop), e.children && (b.children = e.children.map(
        (p) => this.placeSprite(t, p, s)
      )), b;
    },
    placeSpritesheet(t, e, s, n, i, o = 0) {
      const a = c.getData(e);
      if (!a || !a.sprites)
        return console.warn(`Sprite data for key '${e}' not found.`), null;
      const r = this.findSpriteByPath(
        a.sprites,
        s
      );
      if (!r || r.type !== "spritesheet")
        return console.warn(
          `Spritesheet '${s}' not found or is not a spritesheet.`
        ), null;
      const l = t.add.sprite(n, i, s, o);
      return l.setDisplaySize(r.frame_width, r.frame_height), l.setOrigin(0, 0), l;
    },
    createAnimatedSprite(t, e, s = {}) {
      const { name: n, x: i, y: o, frame_width: a, frame_height: r } = e, l = t.add.sprite(i, o, e.getPath());
      l.setName(n), l.setDisplaySize(a, r), l.setOrigin(0, 0);
      const d = [
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
      ], u = {
        key: `${e.getPath()}_animated`,
        frames: t.anims.generateFrameNumbers(e.getPath(), {
          start: 0,
          end: e.frame_count - 1
        }),
        frameRate: 10,
        repeat: -1,
        play: !0
      };
      d.forEach((h) => {
        e[h] !== void 0 && (u[h] = e[h]);
      });
      const f = {
        ...u,
        ...s.animationOptions
      }, g = t.anims.create(f);
      f.play && l.play(f.key);
      const y = (h) => (Object.entries(h).forEach(([$, S]) => {
        d.includes($) && (g[$] = S);
      }), h.frames && (g.frames = t.anims.generateFrameNumbers(
        e.getPath(),
        h.frames
      )), h.paused !== void 0 && (h.paused ? l.anims.pause() : l.anims.resume()), l.anims.play(g), g);
      return {
        sprite: l,
        animation: g,
        animationKey: f.key,
        play: () => l.play(f.key),
        pause: () => l.anims.pause(),
        resume: () => l.anims.resume(),
        stop: () => l.anims.stop(),
        updateAnimation: y
      };
    },
    placeAll(t, e, s = {}) {
      const n = c.getData(e);
      return !n || !n.sprites ? (console.warn(`Sprite data for key '${e}' not found.`), null) : n.sprites.map(
        (i) => m.place(
          t,
          n,
          "sprites",
          i.name,
          this.placeSprite.bind(this),
          s
        )
      );
    },
    get(t, e) {
      const s = c.getData(t);
      if (!s || !s.sprites)
        return console.warn(`Sprite data for key '${t}' not found.`), null;
      const i = e.split("/").join("/");
      let o = s.placedSprites ? s.placedSprites[i] : null;
      if (!o) {
        const r = this.findSpriteByPath(s.sprites, i);
        r && (o = { layerData: r });
      }
      if (!o)
        return null;
      const { layerData: a } = o;
      if (a.type === "spritesheet")
        return {
          layerData: a,
          getSprite: (r = 0) => ({
            texture: a.getPath(),
            frame: r
          })
        };
      if (a.type === "animation") {
        const r = o.sprites[0], l = r.anims.currentAnim;
        return {
          sprite: r,
          animation: l,
          animationKey: l.key,
          play: () => r.play(l.key),
          pause: () => r.anims.pause(),
          resume: () => r.anims.resume(),
          stop: () => r.anims.stop(),
          updateAnimation: (d) => {
          }
        };
      }
      return o.sprites[0];
    },
    getTexture(t, e) {
      const s = c.getData(t);
      return !s || !s.sprites ? (console.warn(`Sprite data for key '${t}' not found.`), null) : this.findSpriteByPath(s.sprites, e) ? e : (console.warn(`Sprite '${e}' not found.`), null);
    },
    findSpriteByPath(t, e) {
      const s = e.split("/");
      let n = t.find((i) => i.name === s[0]);
      for (let i = 1; i < s.length; i++) {
        if (!n || !n.children)
          return null;
        n = n.children.find((o) => o.name === s[i]);
      }
      return n;
    },
    countSprites(t) {
      return m.countRecursive(t);
    }
  };
}
function T(c) {
  return {
    load(t, e, s, n) {
      if (!e || !e.layers || e.layers.length === 0) {
        console.warn("No tiles to load or invalid tiles data");
        return;
      }
      e.layers.forEach((i) => {
        for (let o = 0; o < e.columns; o++)
          for (let a = 0; a < e.rows; a++) {
            const r = `${i.name}_tile_${o}_${a}`, l = `${s}/tiles/${e.tile_slice_size}/${r}.jpg`;
            t.load.image(r, l), t.load.once(`filecomplete-image-${r}`, n), c.options.debug && console.log(`Loading tile: ${r} from ${l}`);
          }
      });
    },
    countTiles(t) {
      return !t || !t.layers ? 0 : t.layers.length * t.columns * t.rows;
    },
    place(t, e, s, n = {}) {
      const i = c.getData(s);
      return !i || !i.tiles ? (console.warn(`Tiles data for key '${s}' not found.`), null) : m.place(
        t,
        i,
        "tiles",
        e,
        this.placeTileLayer.bind(this),
        { ...n, psdKey: s, tilesData: i.tiles }
      );
    },
    placeTileLayer(t, e, s) {
      const { tilesData: n } = s, i = t.add.container(0, 0);
      i.setName(e.name);
      for (let a = 0; a < n.columns; a++)
        for (let r = 0; r < n.rows; r++) {
          const l = `${e.name}_tile_${a}_${r}`, d = a * n.tile_slice_size, u = r * n.tile_slice_size;
          if (t.textures.exists(l)) {
            const f = t.add.image(d, u, l).setOrigin(0, 0);
            i.add(f), c.options.debug && console.log(`Placed tile: ${l} at (${d}, ${u})`);
          } else
            console.warn(`Texture for tile ${l} not found`);
        }
      const o = this.addDebugVisualization(
        t,
        e,
        n,
        s
      );
      return o && i.add(o), { layerData: e, tileLayer: i, debugGraphics: o };
    },
    placeAll(t, e, s = {}) {
      const n = c.getData(e);
      return !n || !n.tiles || !n.tiles.layers ? (console.warn(`Tiles data for key '${e}' not found.`), null) : n.tiles.layers.map(
        (i) => this.place(t, i.name, e, s)
      );
    },
    get(t, e) {
      const s = c.getData(t);
      return !s || !s.placedTiles ? (console.warn(`Placed tile layer data for key '${t}' not found.`), null) : s.placedTiles[e] || null;
    },
    addDebugVisualization(t, e, s, n) {
      if (!n.debug && !c.options.debug)
        return null;
      const i = t.add.graphics();
      i.lineStyle(2, 16711935, 1);
      const o = s.columns * s.tile_slice_size, a = s.rows * s.tile_slice_size;
      return i.strokeRect(0, 0, o, a), i;
    }
  };
}
function k(c) {
  return {
    place(t, e, s, n = {}) {
      const i = c.getData(s);
      return !i || !i.zones ? (console.warn(`Zone data for key '${s}' not found.`), null) : m.place(t, i, "zones", e, this.placeZone.bind(this), n);
    },
    placeZone(t, e, s = {}) {
      const { name: n, bbox: i } = e, { left: o, top: a, right: r, bottom: l } = i, d = r - o, u = l - a, f = t.add.zone(o, a, d, u);
      f.setName(n);
      const g = e.createDebugBox(t, "zone", c, s);
      c.options.debug && console.log(`Placed zone: ${n} at (${o}, ${a}) with dimensions ${d}x${u}`);
      const y = { layerData: e, zone: f, debugGraphics: g };
      return e.children && (y.children = e.children.map((h) => this.placeZone(t, h, s))), y;
    },
    placeAll(t, e, s = {}) {
      const n = c.getData(e);
      return !n || !n.zones ? (console.warn(`Zone data for key '${e}' not found.`), null) : n.zones.map(
        (i) => m.place(t, n, "zones", i.name, this.placeZone.bind(this), s)
      );
    },
    get(t, e) {
      const s = c.getData(t);
      return !s || !s.placedZones ? (console.warn(`Placed zone data for key '${t}' not found.`), null) : s.placedZones[e] || null;
    },
    countZones(t) {
      return m.countRecursive(t);
    }
  };
}
class v extends Phaser.Plugins.BasePlugin {
  constructor(t) {
    super(t), this.psdData = {}, this.options = { debug: !1 };
  }
  boot() {
    this.pluginManager.game.events.once("destroy", this.destroy, this);
  }
  init(t = {}) {
    this.options = { ...this.options, ...t }, this.data = _(this), this.points = L(this), this.sprites = N(this), this.tiles = T(this), this.zones = k(this), this.options.debug && console.log("PsdToJSONPlugin initialized with options:", this.options);
  }
  load(t, e, s) {
    this.data.load(t, e, s);
  }
  getData(t) {
    return this.psdData[t];
  }
}
export {
  v as default
};
