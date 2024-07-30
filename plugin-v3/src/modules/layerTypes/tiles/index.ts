import PsdToPhaserPlugin, { DebugOptions } from "../../../PsdToPhaserPlugin";
import { getDebugOptions } from "../../utils/sharedUtils";

export default function tilesModule(plugin: PsdToPhaserPlugin) {
  return {
        load(
      scene: Phaser.Scene,
      tiles: any,
      basePath: string,
      onProgress: () => void
    ) {
      if (!tiles || tiles.length === 0) {
        console.warn("No tiles to load or invalid tiles data");
        return;
      }

      tiles.forEach((tileset: any) => {
        if (!tileset.lazyLoad) {
          for (let col = 0; col < tileset.columns; col++) {
            for (let row = 0; row < tileset.rows; row++) {
              const tileKey = `${tileset.name}_tile_${col}_${row}`;
              const tilePath = `${basePath}/${tileset.path}/${tileKey}.${tileset.filetype}`;
              scene.load.image(tileKey, tilePath);
              scene.load.once(`filecomplete-image-${tileKey}`, onProgress);
              if (plugin.options.debug) {
                console.log(`Queued tile for loading: ${tileKey} from ${tilePath}`);
              }
            }
          }
        }
      });
    },

    placeTileLayer(
  scene: Phaser.Scene,
  layer: any,
  options: any = {}
): any {
  const group = scene.add.group();
  group.name = layer.name;

  for (let col = 0; col < layer.columns; col++) {
    for (let row = 0; row < layer.rows; row++) {
      const tileKey = `${layer.name}_tile_${col}_${row}`;
      const x = layer.x + col * layer.tile_slice_size;
      const y = layer.y + row * layer.tile_slice_size;

      if (scene.textures.exists(tileKey)) {
        const tile = scene.add.image(x, y, tileKey).setOrigin(0, 0);
        group.add(tile);
        tile.setDepth(layer.initialDepth || 0);

        if (plugin.options.debug) {
          console.log(`Placed tile: ${tileKey} at (${x}, ${y}), depth: ${layer.initialDepth || 0}`);
        }
      } else if (!layer.lazyLoad) {
        console.warn(`Texture for tile ${tileKey} not found`);
      }
    }
  }

  // Set the depth for the entire group
  group.setDepth(layer.initialDepth || 0);

  const debugOptions = getDebugOptions(options.debug, plugin.options.debug);
  if (debugOptions.shape) {
    this.addDebugVisualization(
      scene,
      layer,
      group,
      debugOptions
    );
  }

  return { layerData: layer, tileLayer: group };
},


    placeAll(scene: Phaser.Scene, psdKey: string, options: any = {}): any[] {
  const psdData = plugin.getData(psdKey);
  if (!psdData || !psdData.tiles) {
    console.warn(`Tiles data for key '${psdKey}' not found.`);
    return [];
  }

  console.log(`Placing all tiles for key '${psdKey}'. Total tilesets: ${psdData.tiles.length}`);
  return psdData.tiles.map((layer: any) => this.placeTileLayer(scene, layer, options));
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

      const layer = psdData.tiles.find((l: any) => l.name === layerName);
      if (!layer) {
        console.warn(`Tile layer '${layerName}' not found.`);
        return null;
      }

      return this.placeTileLayer(scene, layer, options);
    },

    

    addDebugVisualization(
      scene: Phaser.Scene,
      layer: any,
      group: Phaser.GameObjects.Group,
      debugOptions: any
    ): void {
      const graphics = scene.add.graphics();
      graphics.lineStyle(2, 0xff00ff, 1);

      if (layer.type === "tileset") {
        const width = layer.columns * layer.tile_slice_size;
        const height = layer.rows * layer.tile_slice_size;
        graphics.strokeRect(layer.x, layer.y, width, height);
      } else {
        graphics.strokeRect(layer.x, layer.y, layer.width, layer.height);
      }

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
      if (!psdData || !psdData.tiles) {
        console.warn(`Tiles data for key '${psdKey}' not found.`);
        return null;
      }

      return (
        psdData.tiles.find((layer: any) => layer.name === layerName) || null
      );
    },
  };
}
