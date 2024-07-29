import PsdToPhaserPlugin, { DebugOptions } from "../../../PsdToPhaserPlugin";
import { getDebugOptions } from "../../utils/sharedUtils";

export default function tilesModule(plugin: PsdToPhaserPlugin) {
  return {
    place(
      scene: Phaser.Scene,
      psdKey: string,
      layerName: string,
      options: any = {}
    ): any {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.tiles) {
        console.warn(`Tiles data for key '${psdKey}' not found.`);
        return null;
      }

      const layer = psdData.tiles.find((l: any) => l.name === layerName);
      if (!layer) {
        console.warn(`Tile layer '${layerName}' not found.`);
        return null;
      }

      return this.placeTileLayer(scene, layer, options);
    },

    placeTileLayer(
      scene: Phaser.Scene,
      layer: any,
      options: any = {}
    ): any {
      console.log('Placing tile layer:', layer.name, 'Lazy:', layer.lazyLoad);
      
      if (layer.lazyLoad) {
        // For lazy-loaded layers, just return the layer data
        return { layerData: layer, tileLayer: null, isLazyLoaded: true };
      }

      const group = scene.add.group();
      group.name = layer.name;

      for (let col = 0; col < layer.columns; col++) {
        for (let row = 0; row < layer.rows; row++) {
          const tileKey = `${layer.name}_tile_${col}_${row}`;
          const x = layer.x + col * layer.tile_slice_size;
          const y = layer.y + row * layer.tile_slice_size;

          if (scene.textures.exists(tileKey)) {
            const tile = scene.add.image(x, y, tileKey).setOrigin(0, 0);
            if (layer.initialDepth !== undefined) {
              tile.setDepth(layer.initialDepth);
            }
            group.add(tile);

            if (plugin.options.debug) {
              console.log(`Placed tile: ${tileKey} at (${x}, ${y}) with depth ${layer.initialDepth}`);
            }
          } else {
            console.warn(`Texture for tile ${tileKey} not found`);
          }
        }
      }

      const debugOptions = getDebugOptions(options.debug, plugin.options.debug);
      if (debugOptions.shape) {
        this.addDebugVisualization(scene, layer, group, debugOptions);
      }

      return { layerData: layer, tileLayer: group, isLazyLoaded: false };
    },

    placeAll(scene: Phaser.Scene, psdKey: string, options: any = {}): any[] {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.tiles) {
        console.warn(`Tiles data for key '${psdKey}' not found.`);
        return [];
      }

      return psdData.tiles.map((layer: any) =>
        this.placeTileLayer(scene, layer, options)
      );
    },

    addDebugVisualization(
      scene: Phaser.Scene,
      layer: any,
      group: Phaser.GameObjects.Group,
      debugOptions: DebugOptions
    ): void {
      const graphics = scene.add.graphics();
      graphics.lineStyle(2, 0xff00ff, 1);

      const width = layer.columns * layer.tile_slice_size;
      const height = layer.rows * layer.tile_slice_size;

      graphics.strokeRect(layer.x, layer.y, width, height);

      if (debugOptions.label) {
        const text = scene.add.text(layer.x, layer.y - 20, layer.name, {
          fontSize: "16px",
          color: "#ff00ff",
        });
        group.add(text);
      }

      group.add(graphics);
    },

    get(psdKey: string, layerName: string): any {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.placedTiles) {
        console.warn(`Placed tile layer data for key '${psdKey}' not found.`);
        return null;
      }

      return psdData.placedTiles[layerName] || null;
    },

    getDebugOptions(
      localDebug: boolean | DebugOptions | undefined,
      globalDebug: boolean | DebugOptions
    ): DebugOptions {
      const defaultOptions: DebugOptions = {
        console: false,
        shape: false,
        label: false,
      };

      if (typeof globalDebug === "boolean") {
        defaultOptions.shape = globalDebug;
      } else if (typeof globalDebug === "object") {
        Object.assign(defaultOptions, globalDebug);
      }

      if (typeof localDebug === "boolean") {
        return localDebug
          ? { console: true, shape: true, label: true }
          : defaultOptions;
      } else if (typeof localDebug === "object") {
        return { ...defaultOptions, ...localDebug };
      }

      return defaultOptions;
    },
  };
}