import PsdToPhaserPlugin, { DebugOptions } from "../../../PsdToPhaserPlugin";
import { createDebugShape } from "../../utils/debugVisualizer";
import { getDebugOptions } from "../../utils/sharedUtils";

export default function tilesModule(plugin: PsdToPhaserPlugin) {
  return {
    load(
      scene: Phaser.Scene,
      tiles: any,
      basePath: string,
      onProgress: () => void
    ) {
      if (!tiles || !tiles.layers || tiles.layers.length === 0) {
        console.warn("No tiles to load or invalid tiles data");
        return;
      }

      tiles.layers.forEach((layer: any) => {
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

    countTiles(tilesData: any): number {
      if (!tilesData || !tilesData.layers) return 0;
      return tilesData.layers.length * tilesData.columns * tilesData.rows;
    },

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

      const layer = psdData.tiles.layers.find((l: any) => l.name === layerName);
      if (!layer) {
        console.warn(`Tile layer '${layerName}' not found.`);
        return null;
      }

      return this.placeTileLayer(scene, psdData.tiles, layer, options);
    },

    placeTileLayer(
      scene: Phaser.Scene,
      tilesData: any,
      layer: any,
      options: any = {}
    ): any {
      const container = scene.add.container(0, 0);
      container.setName(layer.name);

      for (let col = 0; col < tilesData.columns; col++) {
        for (let row = 0; row < tilesData.rows; row++) {
          const tileKey = `${layer.name}_tile_${col}_${row}`;
          const x = col * tilesData.tile_slice_size;
          const y = row * tilesData.tile_slice_size;

          if (scene.textures.exists(tileKey)) {
            const tile = scene.add.image(x, y, tileKey).setOrigin(0, 0);
            container.add(tile);

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
          container,
          debugOptions
        );
      }

      return { layerData: layer, tileLayer: container };
    },

    placeAll(scene: Phaser.Scene, psdKey: string, options: any = {}): any[] {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.tiles || !psdData.tiles.layers) {
        console.warn(`Tiles data for key '${psdKey}' not found.`);
        return [];
      }

      return psdData.tiles.layers.map((layer: any) =>
        this.placeTileLayer(scene, psdData.tiles, layer, options)
      );
    },

    get(psdKey: string, layerName: string): any {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.placedTiles) {
        console.warn(`Placed tile layer data for key '${psdKey}' not found.`);
        return null;
      }

      return psdData.placedTiles[layerName] || null;
    },

    addDebugVisualization(
      scene: Phaser.Scene,
      layer: any,
      tilesData: any,
      container: Phaser.GameObjects.Container,
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
        container.add(text);
      }

      container.add(graphics);
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
