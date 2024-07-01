function g(a) {
  let o = 0, t = !1;
  return {
    load(e, i, s) {
      const n = `${s}/data.json`;
      e.load.json(i, n), e.load.once("complete", () => {
        const l = e.cache.json.get(i);
        this.processJSON(e, i, l, s);
      });
    },
    processJSON(e, i, s, n) {
      a.psdData[i] = {
        ...s,
        basePath: n
      }, a.options.debug && console.log(`Loaded JSON for key "${i}":`, a.psdData[i]), this.loadAssetsFromJSON(e, i, a.psdData[i]);
    },
    loadAssetsFromJSON(e, i, s) {
      const n = s.sprites || [], l = s.tiles || {};
      let r = a.sprites.countSprites(n) + a.tiles.countTiles(l), d = 0;
      a.options.debug && console.log(`Total assets to load: ${r}`);
      const c = () => {
        d++, o = d / r, e.events.emit("psdAssetsLoadProgress", o), a.options.debug && (console.log(`Loaded asset ${d} of ${r}`), console.log(`Loading progress: ${(o * 100).toFixed(2)}%`)), d === r && (t = !0, e.events.emit("psdAssetsLoadComplete"), a.options.debug && console.log("All PSD assets loaded"));
      };
      n.length > 0 && a.sprites.load(e, n, s.basePath, c), l.layers && l.layers.length > 0 && a.tiles.load(e, l, s.basePath, c), r === 0 && (t = !0, e.events.emit("psdAssetsLoadComplete")), e.load.isLoading() || e.load.start();
    },
    get progress() {
      return o;
    },
    get complete() {
      return t;
    }
  };
}
function h(a) {
  return {
    // Implementation for points
  };
}
function $(a) {
  return {
    load(o, t, e, i) {
      t.forEach((s) => {
        this.loadSprite(o, s, e, i);
      });
    },
    loadSprite(o, t, e, i) {
      const { name: s, filename: n } = t, l = `${e}/sprites/${n || s}.png`;
      o.load.image(s, l), o.load.once(`filecomplete-image-${s}`, i), a.options.debug && console.log(`Loading sprite: ${s} from ${l}`);
    },
    create(o, t) {
      t.forEach((e) => {
        const { name: i, x: s, y: n } = e;
        o.add.image(s, n, i), a.options.debug && console.log(`Created sprite: ${i} at (${s}, ${n})`);
      });
    },
    countSprites(o) {
      return Array.isArray(o) ? o.length : 0;
    },
    place(o, t, e) {
      const i = a.getData(e);
      if (!i)
        return console.warn(`PSD data for key '${e}' not found.`), null;
      const s = i.sprites.find((c) => c.name === t);
      if (!s)
        return console.warn(`Sprite '${t}' not found in PSD data for key '${e}'.`), null;
      const { x: n, y: l, width: r, height: d } = s;
      return o.textures.exists(t) ? this.placeLoadedSprite(o, t, n, l, r, d) : (console.warn(`Texture for sprite '${t}' not found. Attempting to load it now.`), this.loadSprite(o, s, i.basePath, () => {
        console.log(`Texture for sprite '${t}' loaded.`), this.placeLoadedSprite(o, t, n, l, r, d);
      }), null);
    },
    placeLoadedSprite(o, t, e, i, s, n) {
      const l = o.add.image(e, i, t);
      return l.setOrigin(0, 0), l.setDisplaySize(s, n), a.options.debug && console.log(`Placed sprite: ${t} at (${e}, ${i}) with dimensions ${s}x${n}`), l;
    }
  };
}
function m(a) {
  return {
    load(o, t, e, i) {
      if (!t || !t.layers || t.layers.length === 0) {
        console.warn("No tiles to load or invalid tiles data");
        return;
      }
      t.layers.forEach((s) => {
        for (let n = 0; n < t.columns; n++)
          for (let l = 0; l < t.rows; l++) {
            const r = `${s.name}_tile_${n}_${l}`, d = `${e}/tiles/${t.tile_slice_size}/${r}.jpg`;
            o.load.image(r, d), o.load.once(`filecomplete-image-${r}`, i), a.options.debug && console.log(`Loading tile: ${r} from ${d}`);
          }
      });
    },
    create(o, t) {
    },
    countTiles(o) {
      return !o || !o.layers ? 0 : o.layers.length * o.columns * o.rows;
    },
    place(o, t, e) {
      const i = a.getData(e);
      if (!i || !i.tiles)
        return console.warn(`Tiles data for key '${e}' not found.`), null;
      const s = i.tiles;
      if (!s.layers.find((r) => r.name === t))
        return console.warn(`Tile layer '${t}' not found in PSD data for key '${e}'.`), null;
      const l = o.add.container(0, 0);
      for (let r = 0; r < s.columns; r++)
        for (let d = 0; d < s.rows; d++) {
          const c = `${t}_tile_${r}_${d}`, u = r * s.tile_slice_size, f = d * s.tile_slice_size;
          if (o.textures.exists(c)) {
            const p = o.add.image(u, f, c).setOrigin(0, 0);
            l.add(p), a.options.debug && console.log(`Placed tile: ${c} at (${u}, ${f})`);
          } else
            console.warn(`Texture for tile ${c} not found`);
        }
      return l;
    }
  };
}
function S(a) {
  return {
    // Implementation for zones
  };
}
class P extends Phaser.Plugins.BasePlugin {
  constructor(o) {
    super(o), this.psdData = {}, this.options = { debug: !1 };
  }
  boot() {
    this.pluginManager.game.events.once("destroy", this.destroy, this);
  }
  init(o = {}) {
    this.options = { ...this.options, ...o }, this.data = g(this), this.points = h(), this.sprites = $(this), this.tiles = m(this), this.zones = S(), this.options.debug && console.log("PsdToJSONPlugin initialized with options:", this.options);
  }
  load(o, t, e) {
    this.data.load(o, t, e);
  }
  getData(o) {
    return this.psdData[o];
  }
}
export {
  P as default
};
