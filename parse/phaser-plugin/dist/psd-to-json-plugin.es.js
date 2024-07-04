var O = Object.defineProperty;
var _ = (c, t, e) => t in c ? O(c, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : c[t] = e;
var z = (c, t, e) => (_(c, typeof t != "symbol" ? t + "" : t, e), e);
const b = class b {
  constructor(t, e = null) {
    this.parent = e, this.children = [], this.lazyLoad = !1, this.isLoaded = !1, Object.keys(t).forEach((a) => {
      a === "children" ? this.children = t[a].map(
        (s) => new b(s, this)
      ) : this[a] = t[a];
    }), this.bbox || (this.bbox = {
      left: this.x,
      top: this.y,
      right: this.x + this.width,
      bottom: this.y + this.height
    });
  }
  isStandardProp(t) {
    return b.standardProps.includes(t);
  }
  getCustomAttributes() {
    return Object.keys(this).filter((t) => !this.isStandardProp(t) && t !== "parent").reduce((t, e) => (t[e] = this[e], t), {});
  }
  createDebugBox(t, e, a, s = {}) {
    if (!this.shouldDebug(a, s))
      return null;
    const r = t.add.graphics(), i = 16711935, n = 2;
    if (r.lineStyle(n, i), e === "zone") {
      const { left: o, top: l, right: d, bottom: u } = this.bbox, h = d - o, m = u - l;
      r.strokeRect(o, l, h, m);
    } else
      e === "sprite" || e === "image" ? this.type === "spritesheet" ? this.placement.forEach((o) => {
        r.strokeRect(
          this.x + o.x,
          this.y + o.y,
          this.frame_width,
          this.frame_height
        );
      }) : r.strokeRect(this.x, this.y, this.width, this.height) : e === "point" && r.strokeCircle(this.x, this.y, 5);
    return r;
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
      const a = e[1], s = this.children.find((r) => r.name === a);
      return s ? s.findByPath(e.slice(1).join("/")) : null;
    }
    return null;
  }
  static place(t, e, a, s, r, i = {}) {
    if (!e || !e[a])
      return console.warn(`${a} data not found.`), null;
    let n;
    if (a === "tiles")
      n = e[a].layers.find((l) => l.name === s);
    else {
      const l = s.split("/");
      n = e[a].find((d) => d.name === l[0]);
      for (let d = 1; d < l.length; d++) {
        if (!n || !n.children)
          return null;
        n = n.children.find(
          (u) => u.name === l[d]
        );
      }
    }
    if (!n)
      return console.warn(`${a} '${s}' not found in PSD data.`), null;
    const o = r(t, n, i);
    return o && (e[`placed${a.charAt(0).toUpperCase() + a.slice(1)}`] || (e[`placed${a.charAt(0).toUpperCase() + a.slice(1)}`] = {}), e[`placed${a.charAt(0).toUpperCase() + a.slice(1)}`][s] = o, o.children && this.storeNestedObjects(e, a, s, o.children)), o;
  }
  static storeNestedObjects(t, e, a, s) {
    s.forEach((r) => {
      const i = `${a}/${r.layerData.name}`;
      t[`placed${e.charAt(0).toUpperCase() + e.slice(1)}`][i] = r, r.children && this.storeNestedObjects(t, e, i, r.children);
    });
  }
  static placeAll(t, e, a, s, r = {}) {
    if (!e || !e[a])
      return console.warn(`${a} data not found.`), null;
    const i = e[a].map(
      (n) => s(t, n, r)
    );
    return e[`placed${a.charAt(0).toUpperCase() + a.slice(1)}`] = i, i;
  }
  static get(t, e, a) {
    const s = `placed${e.charAt(0).toUpperCase() + e.slice(1)}`;
    if (!t || !t[s])
      return console.warn(`Placed ${e} data not found.`), null;
    const r = a.split("/");
    let i = t[s].find(
      (n) => n.layerData.name === r[0]
    );
    for (let n = 1; n < r.length; n++) {
      if (!i || !i.children)
        return null;
      i = i.children.find(
        (o) => o.layerData.name === r[n]
      );
    }
    return i;
  }
  static countRecursive(t) {
    return t.reduce((e, a) => {
      let s = 1;
      return a.children && a.children.length > 0 && (s += this.countRecursive(a.children)), e + s;
    }, 0);
  }
};
z(b, "standardProps", [
  "name",
  "x",
  "y",
  "width",
  "height",
  "children",
  "lazyLoad"
]);
let P = b;
function D(c) {
  return new P(c);
}
function L(c) {
  let t = 0, e = !1, a = [], s = 0, r = 0;
  return {
    load(i, n, o) {
      const l = `${o}/data.json`;
      i.load.json(n, l), i.load.once("complete", () => {
        const d = i.cache.json.get(n);
        this.processJSON(i, n, d, o);
      });
    },
    processJSON(i, n, o, l) {
      c.psdData[n] = {
        ...o,
        basePath: l,
        sprites: o.sprites.map((d) => D(d)),
        zones: o.zones.map((d) => D(d)),
        points: o.points.map((d) => D(d))
      }, c.options.debug && console.log(`Loaded JSON for key "${n}":`, c.psdData[n]), this.loadAssetsFromJSON(i, n, c.psdData[n]);
    },
    loadAssetsFromJSON(i, n, o) {
      const l = this.flattenObjects(o.sprites), d = o.tiles || {};
      s = this.countAssets(l) + c.tiles.countTiles(d), r = 0, c.options.debug && console.log(`Total assets to load: ${s}`);
      const u = () => {
        r++, t = r / s, i.events.emit("psdAssetsLoadProgress", t), c.options.debug && (console.log(`Loaded asset ${r} of ${s}`), console.log(`Loading progress: ${(t * 100).toFixed(2)}%`)), r === s && (e = !0, i.events.emit("psdAssetsLoadComplete"), c.options.debug && console.log("All PSD assets loaded"));
      };
      l.length > 0 && this.loadSprites(i, l, o.basePath, u), d.layers && d.layers.length > 0 && c.tiles.load(i, d, o.basePath, u), s === 0 && (e = !0, i.events.emit("psdAssetsLoadComplete")), i.load.isLoading() || i.load.start();
    },
    loadSprites(i, n, o, l) {
      n.forEach(({ path: d, obj: u }) => {
        if (u.lazyLoad) {
          c.options.debug && console.log(`Skipping load for lazy-loaded sprite: ${d}`);
          return;
        }
        const h = `${o}/sprites/${d}.png`;
        u.type === "atlas" ? (i.load.image(d, h), i.load.once(`filecomplete-image-${d}`, () => {
          i.textures.addAtlas(d, i.textures.get(d).getSourceImage(), u.atlas_data), u.isLoaded = !0, l(), c.options.debug && console.log(`Atlas loaded: ${d}`);
        })) : u.type === "animation" || u.type === "spritesheet" ? (i.load.spritesheet(d, h, {
          frameWidth: u.frame_width,
          frameHeight: u.frame_height
        }), i.load.once(`filecomplete-spritesheet-${d}`, () => {
          u.isLoaded = !0, l();
        })) : (i.load.image(d, h), i.load.once(`filecomplete-image-${d}`, () => {
          u.isLoaded = !0, l();
        })), c.options.debug && console.log(
          `Loading ${u.type === "atlas" ? "atlas" : u.type === "animation" ? "animation spritesheet" : u.type === "spritesheet" ? "spritesheet" : "sprite"}: ${d} from ${h}`
        );
      });
    },
    flattenObjects(i, n = "") {
      return i.reduce((o, l) => {
        const d = n ? `${n}/${l.name}` : l.name;
        return l.lazyLoad ? a.push({ path: d, obj: l }) : (!l.children || l.children.length === 0) && o.push({ path: d, obj: l }), l.children && o.push(...this.flattenObjects(l.children, d)), o;
      }, []);
    },
    countAssets(i) {
      return i.reduce((n, { obj: o }) => n, 0);
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
function N(c) {
  return {
    place(t, e, a, s = {}) {
      const r = c.getData(a);
      return !r || !r.points ? (console.warn(`Point data for key '${a}' not found.`), null) : P.place(
        t,
        r,
        "points",
        e,
        this.placePoint.bind(this),
        s
      );
    },
    placePoint(t, e, a = {}) {
      const { name: s, x: r, y: i } = e, n = t.add.circle(r, i, 5, 16777215, 1);
      n.setName(s);
      const o = e.createDebugBox(
        t,
        "point",
        c,
        a
      );
      c.options.debug && console.log(`Placed point: ${s} at (${r}, ${i})`);
      const l = { layerData: e, point: n, debugGraphics: o };
      return e.children && (l.children = e.children.map(
        (d) => this.placePoint(t, d, a)
      )), l;
    },
    placeAll(t, e, a = {}) {
      const s = c.getData(e);
      return !s || !s.points ? (console.warn(`Point data for key '${e}' not found.`), null) : s.points.map(
        (r) => P.place(
          t,
          s,
          "points",
          r.name,
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
      return P.countRecursive(t);
    }
  };
}
function k(c) {
  return {
    place(t, e, a, s = {}) {
      const r = c.getData(a);
      return !r || !r.sprites ? (console.warn(`Sprite data for key '${a}' not found.`), null) : P.place(
        t,
        r,
        "sprites",
        e,
        this.placeSprite.bind(this),
        s
      );
    },
    placeSprite(t, e, a = {}) {
      const {
        name: s,
        x: r,
        y: i,
        width: n,
        height: o,
        type: l,
        frame_width: d,
        frame_height: u,
        placement: h,
        autoplacement: m = !0,
        lazyLoad: $,
        layerOrder: f
      } = e;
      let S = [], g = null;
      if (!e.children || e.children.length === 0) {
        if ($)
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
          p.sprite.setDepth(f), S.push(p.sprite), g = p;
        } else if (l === "spritesheet" && m)
          h.forEach((p, A) => {
            const x = t.add.sprite(
              r + p.x,
              i + p.y,
              e.getPath(),
              p.frame
            );
            x.setName(`${s}_${A}`), x.setDisplaySize(d, u), x.setOrigin(0, 0), x.setDepth(f), S.push(x);
          });
        else if (l !== "spritesheet" || m) {
          const p = a.useImage ? t.add.image(r, i, e.getPath()) : t.add.sprite(r, i, e.getPath());
          p.setName(s), n !== void 0 && o !== void 0 && p.setDisplaySize(n, o), p.setOrigin(0, 0), p.setDepth(f), S.push(p);
        }
      }
      const w = e.createDebugBox(
        t,
        "sprite",
        c,
        a
      );
      w && w.setDepth(f + 0.1), c.options.debug && console.log(
        `Placed ${l === "atlas" ? "atlas" : l === "spritesheet" ? "spritesheet" : l === "animation" ? "animated sprite" : a.useImage ? "image" : "sprite"}: ${s} at (${r}, ${i}) with dimensions ${n}x${o} and depth ${f}`
      );
      const y = {
        layerData: e,
        sprites: S,
        debugGraphics: w
      };
      return l === "atlas" ? y.getFrameSprite = S[0].getFrameSprite : g && (y.animation = g.animation, y.animationKey = g.animationKey, y.play = g.play, y.pause = g.pause, y.resume = g.resume, y.stop = g.stop, y.updateAnimation = g.updateAnimation), e.children && (y.children = e.children.map(
        (p) => this.placeSprite(t, p, a)
      )), y;
    },
    createAtlasSprite(t, e, a) {
      const { name: s, x: r, y: i, width: n, height: o, atlas_image: l, atlas_data: d, layerOrder: u } = e;
      if (!t.textures.exists(l)) {
        const m = {};
        d.frames.forEach((f) => {
          m[f.name] = {
            frame: { x: f.x, y: f.y, w: f.w, h: f.h }
          };
        });
        const $ = { frames: m, meta: d.meta };
        t.textures.addAtlas(
          l,
          t.textures.get(e.getPath()).getSourceImage(),
          $
        );
      }
      const h = t.add.container(r, i);
      return h.setName(s), d.placement.forEach((m, $) => {
        const f = t.add.sprite(
          m.relative.x,
          m.relative.y,
          l,
          m.frame
        );
        f.setName(`${s}_${m.frame}`), f.setOrigin(0, 0), f.setDepth($), h.add(f);
      }), h.setSize(n, o), h.setDepth(u), h.getFrameSprite = (m) => h.list.find(
        ($) => $.name === `${s}_${m}`
      ), c.options.debug && console.log(
        `Created atlas sprite '${s}' with ${d.placement.length} frames at depth ${u}`
      ), h;
    },
    createAnimatedSprite(t, e, a = {}) {
      const {
        name: s,
        x: r,
        y: i,
        frame_width: n,
        frame_height: o,
        frame_count: l,
        columns: d,
        rows: u
      } = e, h = t.add.sprite(r, i, e.getPath());
      h.setName(s), h.setDisplaySize(n, o), h.setOrigin(0, 0), t.textures.exists(e.getPath()) || t.textures.addSpriteSheet(
        e.getPath(),
        t.textures.get(e.getPath()).getSourceImage(),
        {
          frameWidth: n,
          frameHeight: o,
          startFrame: 0,
          endFrame: l - 1,
          margin: 0,
          spacing: 0
        }
      );
      const m = [
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
      ], $ = {
        key: `${e.getPath()}_animated`,
        frames: t.anims.generateFrameNumbers(e.getPath(), {
          start: 0,
          end: l - 1
        }),
        frameRate: 10,
        repeat: -1
      };
      m.forEach((g) => {
        e[g] !== void 0 && ($[g] = e[g]);
      });
      const f = {
        ...$,
        ...a.animationOptions
      };
      t.anims.exists(f.key) || t.anims.create(f), h.play(f.key);
      const S = (g) => {
        const w = t.anims.get(f.key);
        if (w)
          return Object.entries(g).forEach(([y, p]) => {
            m.includes(y) && (w[y] = p);
          }), g.frames && (w.frames = t.anims.generateFrameNumbers(
            e.getPath(),
            g.frames
          )), g.paused !== void 0 && (g.paused ? h.anims.pause() : h.anims.resume()), h.play(f.key), w;
      };
      return {
        sprite: h,
        animationKey: f.key,
        play: () => h.play(f.key),
        pause: () => h.anims.pause(),
        resume: () => h.anims.resume(),
        stop: () => h.anims.stop(),
        updateAnimation: S
      };
    },
    placeAll(t, e, a = {}) {
      const s = c.getData(e);
      return !s || !s.sprites ? (console.warn(`Sprite data for key '${e}' not found.`), null) : [...s.sprites].sort(
        (i, n) => i.layerOrder - n.layerOrder
      ).map(
        (i) => P.place(
          t,
          s,
          "sprites",
          i.name,
          this.placeSprite.bind(this),
          a
        )
      );
    },
    get(t, e) {
      const a = c.getData(t);
      if (!a || !a.sprites)
        return console.warn(`Sprite data for key '${t}' not found.`), null;
      const r = e.split("/").join("/");
      let i = a.placedSprites ? a.placedSprites[r] : null;
      if (!i) {
        const o = this.findSpriteByPath(a.sprites, r);
        o && (i = { layerData: o });
      }
      if (!i)
        return null;
      const { layerData: n } = i;
      if (n.type === "atlas") {
        const o = i.sprites[0];
        return {
          sprite: o,
          setFrame: (l) => o.setFrame(l)
        };
      } else {
        if (n.type === "spritesheet")
          return {
            layerData: n,
            getSprite: (o = 0) => ({
              texture: n.getPath(),
              frame: o
            })
          };
        if (n.type === "animation") {
          const o = i.sprites[0], l = o.anims.currentAnim;
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
      return i.sprites[0];
    },
    getTexture(t, e) {
      const a = c.getData(t);
      if (!a || !a.sprites)
        return console.warn(`Sprite data for key '${t}' not found.`), null;
      const s = this.findSpriteByPath(a.sprites, e);
      if (!s)
        return console.warn(`Sprite '${e}' not found.`), null;
      if (s.type === "atlas") {
        const r = e.split("/");
        return r.length > 1 ? {
          texture: s.atlas_image,
          frame: r[r.length - 1]
        } : Object.keys(s.atlas_data.frames).map((i) => ({
          texture: s.atlas_image,
          frame: i
        }));
      } else if (s.type === "spritesheet")
        return s.getPath();
      return e;
    },
    findSpriteByPath(t, e) {
      const a = e.split("/");
      let s = t.find((r) => r.name === a[0]);
      for (let r = 1; r < a.length; r++) {
        if (!s || !s.children)
          return null;
        s = s.children.find((i) => i.name === a[r]);
      }
      return s;
    },
    countSprites(t) {
      return P.countRecursive(t);
    },
    loadSprites(t, e, a, s) {
      e.forEach(({ path: r, obj: i }) => {
        if (i.lazyLoad) {
          c.options.debug && console.log(`Skipping load for lazy-loaded sprite: ${r}`);
          return;
        }
        const n = `${a}/sprites/${r}.png`;
        i.type === "atlas" ? t.load.atlas(r, n, i.atlas_data) : i.type === "animation" || i.type === "spritesheet" ? t.load.spritesheet(r, n, {
          frameWidth: i.frame_width,
          frameHeight: i.frame_height
        }) : t.load.image(r, n), t.load.once(
          `filecomplete-${i.type === "atlas" ? "atlas" : i.type === "animation" || i.type === "spritesheet" ? "spritesheet" : "image"}-${r}`,
          () => {
            i.isLoaded = !0, s();
          }
        ), c.options.debug && console.log(
          `Loading ${i.type === "atlas" ? "atlas" : i.type === "animation" ? "animation spritesheet" : i.type === "spritesheet" ? "spritesheet" : "sprite"}: ${r} from ${n}`
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
      e.layers.forEach((r) => {
        for (let i = 0; i < e.columns; i++)
          for (let n = 0; n < e.rows; n++) {
            const o = `${r.name}_tile_${i}_${n}`, l = `${a}/tiles/${e.tile_slice_size}/${o}.jpg`;
            t.load.image(o, l), t.load.once(`filecomplete-image-${o}`, s), c.options.debug && console.log(`Loading tile: ${o} from ${l}`);
          }
      });
    },
    countTiles(t) {
      return !t || !t.layers ? 0 : t.layers.length * t.columns * t.rows;
    },
    place(t, e, a, s = {}) {
      const r = c.getData(a);
      return !r || !r.tiles ? (console.warn(`Tiles data for key '${a}' not found.`), null) : P.place(
        t,
        r,
        "tiles",
        e,
        this.placeTileLayer.bind(this),
        { ...s, psdKey: a, tilesData: r.tiles }
      );
    },
    placeTileLayer(t, e, a) {
      const { tilesData: s } = a, r = t.add.container(0, 0);
      r.setName(e.name);
      for (let n = 0; n < s.columns; n++)
        for (let o = 0; o < s.rows; o++) {
          const l = `${e.name}_tile_${n}_${o}`, d = n * s.tile_slice_size, u = o * s.tile_slice_size;
          if (t.textures.exists(l)) {
            const h = t.add.image(d, u, l).setOrigin(0, 0);
            r.add(h), c.options.debug && console.log(`Placed tile: ${l} at (${d}, ${u})`);
          } else
            console.warn(`Texture for tile ${l} not found`);
        }
      const i = this.addDebugVisualization(
        t,
        e,
        s,
        a
      );
      return i && r.add(i), { layerData: e, tileLayer: r, debugGraphics: i };
    },
    placeAll(t, e, a = {}) {
      const s = c.getData(e);
      return !s || !s.tiles || !s.tiles.layers ? (console.warn(`Tiles data for key '${e}' not found.`), null) : s.tiles.layers.map(
        (r) => this.place(t, r.name, e, a)
      );
    },
    get(t, e) {
      const a = c.getData(t);
      return !a || !a.placedTiles ? (console.warn(`Placed tile layer data for key '${t}' not found.`), null) : a.placedTiles[e] || null;
    },
    addDebugVisualization(t, e, a, s) {
      if (!s.debug && !c.options.debug)
        return null;
      const r = t.add.graphics();
      r.lineStyle(2, 16711935, 1);
      const i = a.columns * a.tile_slice_size, n = a.rows * a.tile_slice_size;
      return r.strokeRect(0, 0, i, n), r;
    }
  };
}
function C(c) {
  return {
    place(t, e, a, s = {}) {
      const r = c.getData(a);
      return !r || !r.zones ? (console.warn(`Zone data for key '${a}' not found.`), null) : P.place(t, r, "zones", e, this.placeZone.bind(this), s);
    },
    placeZone(t, e, a = {}) {
      const { name: s, bbox: r } = e, { left: i, top: n, right: o, bottom: l } = r, d = o - i, u = l - n, h = t.add.zone(i, n, d, u);
      h.setName(s);
      const m = e.createDebugBox(t, "zone", c, a);
      c.options.debug && console.log(`Placed zone: ${s} at (${i}, ${n}) with dimensions ${d}x${u}`);
      const $ = { layerData: e, zone: h, debugGraphics: m };
      return e.children && ($.children = e.children.map((f) => this.placeZone(t, f, a))), $;
    },
    placeAll(t, e, a = {}) {
      const s = c.getData(e);
      return !s || !s.zones ? (console.warn(`Zone data for key '${e}' not found.`), null) : s.zones.map(
        (r) => P.place(t, s, "zones", r.name, this.placeZone.bind(this), a)
      );
    },
    get(t, e) {
      const a = c.getData(t);
      return !a || !a.placedZones ? (console.warn(`Placed zone data for key '${t}' not found.`), null) : a.placedZones[e] || null;
    },
    countZones(t) {
      return P.countRecursive(t);
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
    this.options = { ...this.options, ...t }, this.data = L(this), this.points = N(this), this.sprites = k(this), this.tiles = T(this), this.zones = C(this), this.options.debug && console.log("PsdToJSONPlugin initialized with options:", this.options);
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
