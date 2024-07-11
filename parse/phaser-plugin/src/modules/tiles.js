// modules/tiles.js
import { PSDObject } from "./psdObject";

export default function tilesModule(plugin) {
  return {
    load(scene, tiles, basePath, onProgress) {
      if (!tiles || !tiles.layers || tiles.layers.length === 0) {
        console.warn("No tiles to load or invalid tiles data");
        return;
      }

      tiles.layers.forEach((layer) => {
        for (let col = 0; col < tiles.columns; col++) {
          for (let row = 0; row < tiles.rows; row++) {
            const tileKey = `${layer.name}_tile_${col}_${row}`;
            const tilePath = `${basePath}/tiles/${tiles.tile_slice_size}/${tileKey}.jpg`;
            scene.load.image(tileKey, tilePath);
            scene.load.once(`filecomplete-image-${tileKey}`, onProgress);
            if (plugin.options.debug) {
              console.log(`Loading tile: ${tileKey} from ${tilePath}`);
            }
          }
        }
      });
    },

    countTiles(tilesData) {
      if (!tilesData || !tilesData.layers) return 0;
      return tilesData.layers.length * tilesData.columns * tilesData.rows;
    },

    place(scene, layerName, psdKey, options = {}) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.tiles) {
        console.warn(`Tiles data for key '${psdKey}' not found.`);
        return null;
      }

      return PSDObject.place(
        scene,
        psdData,
        "tiles",
        layerName,
        this.placeTileLayer.bind(this),
        { ...options, psdKey, tilesData: psdData.tiles }
      );
    },

    placeTileLayer(
      scene: Phaser.Scene,
      tilesData: any,
      layer: any,
      options: any = {}
    ): any {
      const group = scene.add.group();
      group.name = layer.name;

      for (let col = 0; col < tilesData.columns; col++) {
        for (let row = 0; row < tilesData.rows; row++) {
          const tileKey = `${layer.name}_tile_${col}_${row}`;
          const x = col * tilesData.tile_slice_size;
          const y = row * tilesData.tile_slice_size;

          if (scene.textures.exists(tileKey)) {
            const tile = scene.add.image(x, y, tileKey).setOrigin(0, 0);
            group.add(tile);

            if (plugin.options.debug) {
              console.log(`Placed tile: ${tileKey} at (${x}, ${y})`);
            }
          } else {
            console.warn(`Texture for tile ${tileKey} not found`);
          }
        }
      }

      const debugOptions = getDebugOptions(options.debug, plugin.options.debug);
      if (debugOptions.shape) {
        this.addDebugVisualization(
          scene,
          layer,
          tilesData,
          group,
          debugOptions
        );
      }

      return { layerData: layer, tileLayer: group };
    },

    addDebugVisualization(
      scene: Phaser.Scene,
      layer: any,
      tilesData: any,
      group: Phaser.GameObjects.Group,
      debugOptions: any
    ): void {
      const graphics = scene.add.graphics();
      graphics.lineStyle(2, 0xff00ff, 1);

      const width = tilesData.columns * tilesData.tile_slice_size;
      const height = tilesData.rows * tilesData.tile_slice_size;

      graphics.strokeRect(0, 0, width, height);

      if (debugOptions.label) {
        const text = scene.add.text(0, -20, layer.name, {
          fontSize: "16px",
          color: "#ff00ff",
        });
        group.add(text);
      }

      group.add(graphics);
    },
    placeAll(scene, psdKey, options = {}) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.tiles || !psdData.tiles.layers) {
        console.warn(`Tiles data for key '${psdKey}' not found.`);
        return null;
      }

      return psdData.tiles.layers.map((layer) =>
        this.place(scene, layer.name, psdKey, options)
      );
    },

    get(psdKey, layerName) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.placedTiles) {
        console.warn(`Placed tile layer data for key '${psdKey}' not found.`);
        return null;
      }

      return psdData.placedTiles[layerName] || null;
    },
  };
}
