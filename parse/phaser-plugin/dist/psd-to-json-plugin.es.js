var A = Object.defineProperty;
var _ = (c, t, e) => t in c ? A(c, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : c[t] = e;
var z = (c, t, e) => (_(c, typeof t != "symbol" ? t + "" : t, e), e);
const D = class D {
  constructor(t, e = null) {
    this.parent = e, this.children = [], this.lazyLoad = !1, this.isLoaded = !1, Object.keys(t).forEach((a) => {
      a === "children" ? this.children = t[a].map(
        (s) => new D(s, this)
      ) : this[a] = t[a];
    }), this.bbox || (this.bbox = {
      left: this.x,
      top: this.y,
      right: this.x + this.width,
      bottom: this.y + this.height
    });
  }
  isStandardProp(t) {
    return D.standardProps.includes(t);
  }
  getCustomAttributes() {
    return Object.keys(this).filter((t) => !this.isStandardProp(t) && t !== "parent").reduce((t, e) => (t[e] = this[e], t), {});
  }
  createDebugBox(t, e, a, s = {}) {
    if (!this.shouldDebug(a, s))
      return null;
    const i = t.add.graphics(), n = 16711935, r = 2;
    if (i.lineStyle(r, n), e === "zone") {
      const { left: o, top: l, right: d, bottom: h } = this.bbox, u = d - o, g = h - l;
      i.strokeRect(o, l, u, g);
    } else
      e === "sprite" || e === "image" ? this.type === "spritesheet" ? this.placement.forEach((o) => {
        i.strokeRect(
          this.x + o.x,
          this.y + o.y,
          this.frame_width,
          this.frame_height
        );
      }) : i.strokeRect(this.x, this.y, this.width, this.height) : e === "point" && i.strokeCircle(this.x, this.y, 5);
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
      const a = e[1], s = this.children.find((i) => i.name === a);
      return s ? s.findByPath(e.slice(1).join("/")) : null;
    }
    return null;
  }
  static place(t, e, a, s, i, n = {}) {
    if (!e || !e[a])
      return console.warn(`${a} data not found.`), null;
    let r;
    if (a === "tiles")
      r = e[a].layers.find((l) => l.name === s);
    else {
      const l = s.split("/");
      r = e[a].find((d) => d.name === l[0]);
      for (let d = 1; d < l.length; d++) {
        if (!r || !r.children)
          return null;
        r = r.children.find(
          (h) => h.name === l[d]
        );
      }
    }
    if (!r)
      return console.warn(`${a} '${s}' not found in PSD data.`), null;
    const o = i(t, r, n);
    return o && (e[`placed${a.charAt(0).toUpperCase() + a.slice(1)}`] || (e[`placed${a.charAt(0).toUpperCase() + a.slice(1)}`] = {}), e[`placed${a.charAt(0).toUpperCase() + a.slice(1)}`][s] = o, o.children && this.storeNestedObjects(e, a, s, o.children)), o;
  }
  static storeNestedObjects(t, e, a, s) {
    s.forEach((i) => {
      const n = `${a}/${i.layerData.name}`;
      t[`placed${e.charAt(0).toUpperCase() + e.slice(1)}`][n] = i, i.children && this.storeNestedObjects(t, e, n, i.children);
    });
  }
  static placeAll(t, e, a, s, i = {}) {
    if (!e || !e[a])
      return console.warn(`${a} data not found.`), null;
    const n = e[a].map(
      (r) => s(t, r, i)
    );
    return e[`placed${a.charAt(0).toUpperCase() + a.slice(1)}`] = n, n;
  }
  static get(t, e, a) {
    const s = `placed${e.charAt(0).toUpperCase() + e.slice(1)}`;
    if (!t || !t[s])
      return console.warn(`Placed ${e} data not found.`), null;
    const i = a.split("/");
    let n = t[s].find(
      (r) => r.layerData.name === i[0]
    );
    for (let r = 1; r < i.length; r++) {
      if (!n || !n.children)
        return null;
      n = n.children.find(
        (o) => o.layerData.name === i[r]
      );
    }
    return n;
  }
  static countRecursive(t) {
    return t.reduce((e, a) => {
      let s = 1;
      return a.children && a.children.length > 0 && (s += this.countRecursive(a.children)), e + s;
    }, 0);
  }
};
z(D, "standardProps", [
  "name",
  "x",
  "y",
  "width",
  "height",
  "children",
  "lazyLoad"
]);
let y = D;
function x(c) {
  return new y(c);
}
function L(c) {
  let t = 0, e = !1, a = [], s = 0, i = 0;
  return {
    load(n, r, o) {
      const l = `${o}/data.json`;
      n.load.json(r, l), n.load.once("complete", () => {
        const d = n.cache.json.get(r);
        this.processJSON(n, r, d, o);
      });
    },
    processJSON(n, r, o, l) {
      c.psdData[r] = {
        ...o,
        basePath: l,
        sprites: o.sprites.map((d) => x(d)),
        zones: o.zones.map((d) => x(d)),
        points: o.points.map((d) => x(d))
      }, c.options.debug && console.log(`Loaded JSON for key "${r}":`, c.psdData[r]), this.loadAssetsFromJSON(n, r, c.psdData[r]);
    },
    loadAssetsFromJSON(n, r, o) {
      const l = this.flattenObjects(o.sprites), d = o.tiles || {};
      s = this.countAssets(l) + c.tiles.countTiles(d), i = 0, c.options.debug && console.log(`Total assets to load: ${s}`);
      const h = () => {
        i++, t = i / s, n.events.emit("psdAssetsLoadProgress", t), c.options.debug && (console.log(`Loaded asset ${i} of ${s}`), console.log(`Loading progress: ${(t * 100).toFixed(2)}%`)), i === s && (e = !0, n.events.emit("psdAssetsLoadComplete"), c.options.debug && console.log("All PSD assets loaded"));
      };
      l.length > 0 && this.loadSprites(n, l, o.basePath, h), d.layers && d.layers.length > 0 && c.tiles.load(n, d, o.basePath, h), s === 0 && (e = !0, n.events.emit("psdAssetsLoadComplete")), n.load.isLoading() || n.load.start();
    },
    loadSprites(n, r, o, l) {
      r.forEach(({ path: d, obj: h }) => {
        if (h.lazyLoad) {
          c.options.debug && console.log(`Skipping load for lazy-loaded sprite: ${d}`);
          return;
        }
        const u = `${o}/sprites/${d}.png`;
        h.type === "animation" || h.type === "spritesheet" ? n.load.spritesheet(d, u, {
          frameWidth: h.frame_width,
          frameHeight: h.frame_height
        }) : n.load.image(d, u), n.load.once(`filecomplete-${h.type === "animation" || h.type === "spritesheet" ? "spritesheet" : "image"}-${d}`, () => {
          h.isLoaded = !0, l();
        }), c.options.debug && console.log(`Loading ${h.type === "animation" ? "animation" : h.type === "spritesheet" ? "spritesheet" : "sprite"}: ${d} from ${u}`);
      });
    },
    flattenObjects(n, r = "") {
      return n.reduce((o, l) => {
        const d = r ? `${r}/${l.name}` : l.name;
        return l.lazyLoad ? a.push({ path: d, obj: l }) : (!l.children || l.children.length === 0) && o.push({ path: d, obj: l }), l.children && o.push(...this.flattenObjects(l.children, d)), o;
      }, []);
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
function k(c) {
  return {
    place(t, e, a, s = {}) {
      const i = c.getData(a);
      return !i || !i.points ? (console.warn(`Point data for key '${a}' not found.`), null) : y.place(
        t,
        i,
        "points",
        e,
        this.placePoint.bind(this),
        s
      );
    },
    placePoint(t, e, a = {}) {
      const { name: s, x: i, y: n } = e, r = t.add.circle(i, n, 5, 16777215, 1);
      r.setName(s);
      const o = e.createDebugBox(
        t,
        "point",
        c,
        a
      );
      c.options.debug && console.log(`Placed point: ${s} at (${i}, ${n})`);
      const l = { layerData: e, point: r, debugGraphics: o };
      return e.children && (l.children = e.children.map(
        (d) => this.placePoint(t, d, a)
      )), l;
    },
    placeAll(t, e, a = {}) {
      const s = c.getData(e);
      return !s || !s.points ? (console.warn(`Point data for key '${e}' not found.`), null) : s.points.map(
        (i) => y.place(
          t,
          s,
          "points",
          i.name,
          this.placePoint.bind(this),
          a
        )
      );
    },
    get(t, e) {
      const a = c.getData(t);
      return !a || !a.placedPoints ? (console.warn(`Placed point data for key '${t}' not found.`), null) : a.placedPoints[e] || null;
    },
    countPoints(t) {
      return y.countRecursive(t);
    }
  };
}
function N(c) {
  return {
    place(t, e, a, s = {}) {
      const i = c.getData(a);
      return !i || !i.sprites ? (console.warn(`Sprite data for key '${a}' not found.`), null) : y.place(
        t,
        i,
        "sprites",
        e,
        this.placeSprite.bind(this),
        s
      );
    },
    placeSprite(t, e, a = {}) {
      const {
        name: s,
        x: i,
        y: n,
        width: r,
        height: o,
        type: l,
        frame_width: d,
        frame_height: h,
        placement: u,
        autoplacement: g = !0,
        lazyLoad: P,
        layerOrder: f
      } = e;
      let S = [], m = null;
      if (!e.children || e.children.length === 0) {
        if (P)
          return c.options.debug && console.log(
            `Sprite '${e.getPath()}' is set to lazy load. Skipping placement.`
          ), { layerData: e, sprites: [], debugGraphics: null };
        if (!e.isLoaded)
          return console.warn(`Sprite '${e.getPath()}' hasn't been loaded yet.`), { layerData: e, sprites: [], debugGraphics: null };
        if (l === "atlas") {
          const p = this.createAtlasSprite(t, e, a);
          p.setDepth(f), S.push(p);
        } else if (l === "animation") {
          const p = this.createAnimatedSprite(
            t,
            e,
            a
          );
          p.sprite.setDepth(f), S.push(p.sprite), m = p;
        } else if (l === "spritesheet" && g)
          u.forEach((p, O) => {
            const w = t.add.sprite(
              i + p.x,
              n + p.y,
              e.getPath(),
              p.frame
            );
            w.setName(`${s}_${O}`), w.setDisplaySize(d, h), w.setOrigin(0, 0), w.setDepth(f), S.push(w);
          });
        else if (l !== "spritesheet" || g) {
          const p = a.useImage ? t.add.image(i, n, e.getPath()) : t.add.sprite(i, n, e.getPath());
          p.setName(s), r !== void 0 && o !== void 0 && p.setDisplaySize(r, o), p.setOrigin(0, 0), p.setDepth(f), S.push(p);
        }
      }
      const b = e.createDebugBox(
        t,
        "sprite",
        c,
        a
      );
      b && b.setDepth(f + 0.1), c.options.debug && console.log(
        `Placed ${l === "atlas" ? "atlas" : l === "spritesheet" ? "spritesheet" : l === "animation" ? "animated sprite" : a.useImage ? "image" : "sprite"}: ${s} at (${i}, ${n}) with dimensions ${r}x${o} and depth ${f}`
      );
      const $ = {
        layerData: e,
        sprites: S,
        debugGraphics: b
      };
      return l === "atlas" ? $.getFrameSprite = S[0].getFrameSprite : m && ($.animation = m.animation, $.animationKey = m.animationKey, $.play = m.play, $.pause = m.pause, $.resume = m.resume, $.stop = m.stop, $.updateAnimation = m.updateAnimation), e.children && ($.children = e.children.map(
        (p) => this.placeSprite(t, p, a)
      )), $;
    },
    createAtlasSprite(t, e, a) {
      const { name: s, x: i, y: n, width: r, height: o, atlas_image: l, atlas_data: d } = e;
      t.textures.exists(l) || t.textures.addAtlas(
        l,
        t.textures.get(e.getPath()).getSourceImage(),
        d
      );
      const h = t.add.container(i, n);
      h.setName(s);
      const u = Object.keys(d.frames);
      return u.forEach((g) => {
        const P = d.frames[g], f = t.add.sprite(
          P.relative.x,
          P.relative.y,
          l,
          g
        );
        f.setName(`${s}_${g}`), f.setOrigin(0, 0), h.add(f);
      }), h.setSize(r, o), h.getFrameSprite = (g) => h.list.find(
        (P) => P.name === `${s}_${g}`
      ), c.options.debug && console.log(
        `Created atlas sprite '${s}' with ${u.length} frames`
      ), h;
    },
    createAnimatedSprite(t, e, a = {}) {
      const {
        name: s,
        x: i,
        y: n,
        frame_width: r,
        frame_height: o,
        frame_count: l,
        columns: d,
        rows: h
      } = e, u = t.add.sprite(i, n, e.getPath());
      u.setName(s), u.setDisplaySize(r, o), u.setOrigin(0, 0), t.textures.exists(e.getPath()) || t.textures.addSpriteSheet(
        e.getPath(),
        t.textures.get(e.getPath()).getSourceImage(),
        {
          frameWidth: r,
          frameHeight: o,
          startFrame: 0,
          endFrame: l - 1,
          margin: 0,
          spacing: 0
        }
      );
      const g = [
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
      ], P = {
        key: `${e.getPath()}_animated`,
        frames: t.anims.generateFrameNumbers(e.getPath(), {
          start: 0,
          end: l - 1
        }),
        frameRate: 10,
        repeat: -1
      };
      g.forEach((m) => {
        e[m] !== void 0 && (P[m] = e[m]);
      });
      const f = {
        ...P,
        ...a.animationOptions
      };
      t.anims.exists(f.key) || t.anims.create(f), u.play(f.key);
      const S = (m) => {
        const b = t.anims.get(f.key);
        if (b)
          return Object.entries(m).forEach(([$, p]) => {
            g.includes($) && (b[$] = p);
          }), m.frames && (b.frames = t.anims.generateFrameNumbers(
            e.getPath(),
            m.frames
          )), m.paused !== void 0 && (m.paused ? u.anims.pause() : u.anims.resume()), u.play(f.key), b;
      };
      return {
        sprite: u,
        animationKey: f.key,
        play: () => u.play(f.key),
        pause: () => u.anims.pause(),
        resume: () => u.anims.resume(),
        stop: () => u.anims.stop(),
        updateAnimation: S
      };
    },
    placeAll(t, e, a = {}) {
      const s = c.getData(e);
      return !s || !s.sprites ? (console.warn(`Sprite data for key '${e}' not found.`), null) : [...s.sprites].sort(
        (n, r) => n.layerOrder - r.layerOrder
      ).map(
        (n) => y.place(
          t,
          s,
          "sprites",
          n.name,
          this.placeSprite.bind(this),
          a
        )
      );
    },
    get(t, e) {
      const a = c.getData(t);
      if (!a || !a.sprites)
        return console.warn(`Sprite data for key '${t}' not found.`), null;
      const i = e.split("/").join("/");
      let n = a.placedSprites ? a.placedSprites[i] : null;
      if (!n) {
        const o = this.findSpriteByPath(a.sprites, i);
        o && (n = { layerData: o });
      }
      if (!n)
        return null;
      const { layerData: r } = n;
      if (r.type === "atlas") {
        const o = n.sprites[0];
        return {
          sprite: o,
          setFrame: (l) => o.setFrame(l)
        };
      } else {
        if (r.type === "spritesheet")
          return {
            layerData: r,
            getSprite: (o = 0) => ({
              texture: r.getPath(),
              frame: o
            })
          };
        if (r.type === "animation") {
          const o = n.sprites[0], l = o.anims.currentAnim;
          return {
            sprite: o,
            animation: l,
            animationKey: l.key,
            play: () => o.play(l.key),
            pause: () => o.anims.pause(),
            resume: () => o.anims.resume(),
            stop: () => o.anims.stop(),
            updateAnimation: (d) => {
            }
          };
        }
      }
      return n.sprites[0];
    },
    getTexture(t, e) {
      const a = c.getData(t);
      if (!a || !a.sprites)
        return console.warn(`Sprite data for key '${t}' not found.`), null;
      const s = this.findSpriteByPath(a.sprites, e);
      if (!s)
        return console.warn(`Sprite '${e}' not found.`), null;
      if (s.type === "atlas") {
        const i = e.split("/");
        return i.length > 1 ? {
          texture: s.atlas_image,
          frame: i[i.length - 1]
        } : Object.keys(s.atlas_data.frames).map((n) => ({
          texture: s.atlas_image,
          frame: n
        }));
      } else if (s.type === "spritesheet")
        return s.getPath();
      return e;
    },
    findSpriteByPath(t, e) {
      const a = e.split("/");
      let s = t.find((i) => i.name === a[0]);
      for (let i = 1; i < a.length; i++) {
        if (!s || !s.children)
          return null;
        s = s.children.find((n) => n.name === a[i]);
      }
      return s;
    },
    countSprites(t) {
      return y.countRecursive(t);
    },
    loadSprites(t, e, a, s) {
      e.forEach(({ path: i, obj: n }) => {
        if (n.lazyLoad) {
          c.options.debug && console.log(`Skipping load for lazy-loaded sprite: ${i}`);
          return;
        }
        const r = `${a}/sprites/${i}.png`;
        n.type === "atlas" ? t.load.atlas(i, r, n.atlas_data) : n.type === "animation" || n.type === "spritesheet" ? t.load.spritesheet(i, r, {
          frameWidth: n.frame_width,
          frameHeight: n.frame_height
        }) : t.load.image(i, r), t.load.once(
          `filecomplete-${n.type === "atlas" ? "atlas" : n.type === "animation" || n.type === "spritesheet" ? "spritesheet" : "image"}-${i}`,
          () => {
            n.isLoaded = !0, s();
          }
        ), c.options.debug && console.log(
          `Loading ${n.type === "atlas" ? "atlas" : n.type === "animation" ? "animation spritesheet" : n.type === "spritesheet" ? "spritesheet" : "sprite"}: ${i} from ${r}`
        );
      });
    }
  };
}
function T(c) {
  return {
    load(t, e, a, s) {
      if (!e || !e.layers || e.layers.length === 0) {
        console.warn("No tiles to load or invalid tiles data");
        return;
      }
      e.layers.forEach((i) => {
        for (let n = 0; n < e.columns; n++)
          for (let r = 0; r < e.rows; r++) {
            const o = `${i.name}_tile_${n}_${r}`, l = `${a}/tiles/${e.tile_slice_size}/${o}.jpg`;
            t.load.image(o, l), t.load.once(`filecomplete-image-${o}`, s), c.options.debug && console.log(`Loading tile: ${o} from ${l}`);
          }
      });
    },
    countTiles(t) {
      return !t || !t.layers ? 0 : t.layers.length * t.columns * t.rows;
    },
    place(t, e, a, s = {}) {
      const i = c.getData(a);
      return !i || !i.tiles ? (console.warn(`Tiles data for key '${a}' not found.`), null) : y.place(
        t,
        i,
        "tiles",
        e,
        this.placeTileLayer.bind(this),
        { ...s, psdKey: a, tilesData: i.tiles }
      );
    },
    placeTileLayer(t, e, a) {
      const { tilesData: s } = a, i = t.add.container(0, 0);
      i.setName(e.name);
      for (let r = 0; r < s.columns; r++)
        for (let o = 0; o < s.rows; o++) {
          const l = `${e.name}_tile_${r}_${o}`, d = r * s.tile_slice_size, h = o * s.tile_slice_size;
          if (t.textures.exists(l)) {
            const u = t.add.image(d, h, l).setOrigin(0, 0);
            i.add(u), c.options.debug && console.log(`Placed tile: ${l} at (${d}, ${h})`);
          } else
            console.warn(`Texture for tile ${l} not found`);
        }
      const n = this.addDebugVisualization(
        t,
        e,
        s,
        a
      );
      return n && i.add(n), { layerData: e, tileLayer: i, debugGraphics: n };
    },
    placeAll(t, e, a = {}) {
      const s = c.getData(e);
      return !s || !s.tiles || !s.tiles.layers ? (console.warn(`Tiles data for key '${e}' not found.`), null) : s.tiles.layers.map(
        (i) => this.place(t, i.name, e, a)
      );
    },
    get(t, e) {
      const a = c.getData(t);
      return !a || !a.placedTiles ? (console.warn(`Placed tile layer data for key '${t}' not found.`), null) : a.placedTiles[e] || null;
    },
    addDebugVisualization(t, e, a, s) {
      if (!s.debug && !c.options.debug)
        return null;
      const i = t.add.graphics();
      i.lineStyle(2, 16711935, 1);
      const n = a.columns * a.tile_slice_size, r = a.rows * a.tile_slice_size;
      return i.strokeRect(0, 0, n, r), i;
    }
  };
}
function C(c) {
  return {
    place(t, e, a, s = {}) {
      const i = c.getData(a);
      return !i || !i.zones ? (console.warn(`Zone data for key '${a}' not found.`), null) : y.place(t, i, "zones", e, this.placeZone.bind(this), s);
    },
    placeZone(t, e, a = {}) {
      const { name: s, bbox: i } = e, { left: n, top: r, right: o, bottom: l } = i, d = o - n, h = l - r, u = t.add.zone(n, r, d, h);
      u.setName(s);
      const g = e.createDebugBox(t, "zone", c, a);
      c.options.debug && console.log(`Placed zone: ${s} at (${n}, ${r}) with dimensions ${d}x${h}`);
      const P = { layerData: e, zone: u, debugGraphics: g };
      return e.children && (P.children = e.children.map((f) => this.placeZone(t, f, a))), P;
    },
    placeAll(t, e, a = {}) {
      const s = c.getData(e);
      return !s || !s.zones ? (console.warn(`Zone data for key '${e}' not found.`), null) : s.zones.map(
        (i) => y.place(t, s, "zones", i.name, this.placeZone.bind(this), a)
      );
    },
    get(t, e) {
      const a = c.getData(t);
      return !a || !a.placedZones ? (console.warn(`Placed zone data for key '${t}' not found.`), null) : a.placedZones[e] || null;
    },
    countZones(t) {
      return y.countRecursive(t);
    }
  };
}
class B extends Phaser.Plugins.BasePlugin {
  constructor(t) {
    super(t), this.psdData = {}, this.options = { debug: !1 };
  }
  boot() {
    this.pluginManager.game.events.once("destroy", this.destroy, this);
  }
  init(t = {}) {
    this.options = { ...this.options, ...t }, this.data = L(this), this.points = k(this), this.sprites = N(this), this.tiles = T(this), this.zones = C(this), this.options.debug && console.log("PsdToJSONPlugin initialized with options:", this.options);
  }
  load(t, e, a) {
    this.data.load(t, e, a);
  }
  getData(t) {
    return this.psdData[t];
  }
}
export {
  B as default
};
