// modules/data.js
import { createPSDObject } from "./psdObject";

export default function dataModule(plugin) {
  let progress = 0;
  let complete = false;
  let lazyLoadQueue = [];
  let totalAssets = 0;
  let loadedAssets = 0;

  return {
    load(scene, key, psdFolderPath) {
      const jsonPath = `${psdFolderPath}/data.json`;
      scene.load.json(key, jsonPath);
      scene.load.once("complete", () => {
        const data = scene.cache.json.get(key);
        this.processJSON(scene, key, data, psdFolderPath);
      });
    },

    processJSON(scene, key, data, psdFolderPath) {
      plugin.psdData[key] = {
        ...data,
        basePath: psdFolderPath,
        sprites: data.sprites.map((spriteData) => createPSDObject(spriteData)),
        zones: data.zones.map((zoneData) => createPSDObject(zoneData)),
        points: data.points.map((pointData) => createPSDObject(pointData)),
      };

      if (plugin.options.debug) {
        console.log(`Loaded JSON for key "${key}":`, plugin.psdData[key]);
      }

      this.loadAssetsFromJSON(scene, key, plugin.psdData[key]);
    },

    loadAssetsFromJSON(scene, key, data) {
      const spritesToLoad = this.flattenObjects(data.sprites);
      const tilesToLoad = data.tiles || {};

      totalAssets = this.countAssets(spritesToLoad) + plugin.tiles.countTiles(tilesToLoad);
      loadedAssets = 0;

      if (plugin.options.debug) {
        console.log(`Total assets to load: ${totalAssets}`);
      }

      const updateProgress = () => {
        loadedAssets++;
        progress = loadedAssets / totalAssets;
        scene.events.emit("psdAssetsLoadProgress", progress);

        if (plugin.options.debug) {
          console.log(`Loaded asset ${loadedAssets} of ${totalAssets}`);
          console.log(`Loading progress: ${(progress * 100).toFixed(2)}%`);
        }

        if (loadedAssets === totalAssets) {
          complete = true;
          scene.events.emit("psdAssetsLoadComplete");

          if (plugin.options.debug) {
            console.log("All PSD assets loaded");
          }
        }
      };

      // Load sprites
      if (spritesToLoad.length > 0) {
        this.loadSprites(scene, spritesToLoad, data.basePath, updateProgress);
      }

      // Load tiles
      if (tilesToLoad.layers && tilesToLoad.layers.length > 0) {
        plugin.tiles.load(scene, tilesToLoad, data.basePath, updateProgress);
      }

      // If no assets to load, emit complete event
      if (totalAssets === 0) {
        complete = true;
        scene.events.emit("psdAssetsLoadComplete");
      }

      // Start Phaser loader if it's not already running
      if (!scene.load.isLoading()) {
        scene.load.start();
      }
    },

 loadSprites(scene, sprites, basePath, onProgress) {
  sprites.forEach(({ path, obj }) => {
    if (obj.lazyLoad) {
      if (plugin.options.debug) {
        console.log(`Skipping load for lazy-loaded sprite: ${path}`);
      }
      return;
    }

    const filePath = `${basePath}/sprites/${path}.png`;

    if (obj.type === "atlas") {
      // Load the atlas image
      scene.load.image(path, filePath);
      
      // After the image is loaded, create the atlas
      scene.load.once(`filecomplete-image-${path}`, () => {
        scene.textures.addAtlas(path, scene.textures.get(path).getSourceImage(), obj.atlas_data);
        obj.isLoaded = true;
        onProgress();
        if (plugin.options.debug) {
          console.log(`Atlas loaded: ${path}`);
        }
      });
    } else if (obj.type === "animation" || obj.type === "spritesheet") {
      scene.load.spritesheet(path, filePath, {
        frameWidth: obj.frame_width,
        frameHeight: obj.frame_height,
      });
      scene.load.once(`filecomplete-spritesheet-${path}`, () => {
        obj.isLoaded = true;
        onProgress();
      });
    } else {
      scene.load.image(path, filePath);
      scene.load.once(`filecomplete-image-${path}`, () => {
        obj.isLoaded = true;
        onProgress();
      });
    }

    if (plugin.options.debug) {
      console.log(
        `Loading ${
          obj.type === "atlas"
            ? "atlas"
            : obj.type === "animation"
            ? "animation spritesheet"
            : obj.type === "spritesheet"
            ? "spritesheet"
            : "sprite"
        }: ${path} from ${filePath}`
      );
    }
  });
},
    flattenObjects(objects, prefix = "") {
      return objects.reduce((acc, obj) => {
        const path = prefix ? `${prefix}/${obj.name}` : obj.name;
        if (obj.lazyLoad) {
          lazyLoadQueue.push({ path, obj });
        } else if (!obj.children || obj.children.length === 0) {
          acc.push({ path, obj });
        }
        if (obj.children) {
          acc.push(...this.flattenObjects(obj.children, path));
        }
        return acc;
      }, []);
    },

    countAssets(sprites) {
      return sprites.reduce((count, { obj }) => {
    return count
      }, 0);
    },

    getLazyLoadQueue() {
      return lazyLoadQueue;
    },

    get progress() {
      return progress;
    },

    get complete() {
      return complete;
    },
  };
}