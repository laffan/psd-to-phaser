// src/modules/place/index.ts

import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';
import { placeTiles } from './types/tiles';
import { placeSprites } from './types/sprites';
import { placeZones } from './types/zones';
import { placePoints } from './types/points';

export default function placeModule(plugin: PsdToPhaserPlugin) {
  return function place(scene: Phaser.Scene, psdKey: string, layerPath: string, options: { depth?: number } = {}): Promise<Phaser.GameObjects.Group> {
    return new Promise((resolve) => {
      const psdData = plugin.getData(psdKey);
      if (!psdData) {
        console.error(`No data found for key: ${psdKey}`);
        resolve(scene.add.group());
        return;
      }

      const tileSliceSize = psdData.tile_slice_size || 150;
      const group = scene.add.group();

      const targetLayer = findLayer(psdData.layers, layerPath.split('/'));
      if (!targetLayer) {
        console.error(`No layer found with path: ${layerPath}`);
        resolve(group);
        return;
      }

      placeLayerRecursively(scene, targetLayer, plugin, tileSliceSize, group, () => {
        scene.events.emit('layerPlaced', layerPath);
        resolve(group);
      }, psdKey, options, 0);
    });
  };
}

function findLayer(layers: any[], pathParts: string[]): any {
  if (pathParts.length === 0) return layers;
  const [current, ...rest] = pathParts;
  const found = layers.find((layer: any) => layer.name === current);
  if (!found) return null;
  if (rest.length === 0) return found;
  return findLayer(found.children || [], rest);
}

function placeLayerRecursively(
  scene: Phaser.Scene,
  layer: any,
  plugin: PsdToPhaserPlugin,
  tileSliceSize: number,
  group: Phaser.GameObjects.Group,
  resolve: () => void,
  psdKey: string,
  options: { depth?: number },
  currentDepth: number
): void {
  if (options.depth !== undefined && currentDepth > options.depth) {
    resolve();
    return;
  }

  if (layer.category === 'group') {
    if (Array.isArray(layer.children)) {
      let childrenPlaced = 0;
      layer.children.forEach((child: any) => {
        placeLayerRecursively(scene, child, plugin, tileSliceSize, group, () => {
          childrenPlaced++;
          if (childrenPlaced === layer.children.length) {
            resolve();
          }
        }, psdKey, options, currentDepth + 1);
      });
    } else {
      resolve();
    }
  } else {
    switch (layer.category) {
      case 'tileset':
        placeTiles(scene, layer, plugin, tileSliceSize, group, resolve, psdKey);
        break;
      case 'sprite':
        placeSprites(scene, layer, plugin, group, resolve, psdKey);
        break;
      case 'zone':
        placeZones(scene, layer, plugin, group, resolve, psdKey);
        break;
      case 'point':
        placePoints(scene, layer, plugin, group, resolve, psdKey);
        break;
      default:
        console.error(`Unknown layer category: ${layer.category}`);
        resolve();
    }
  }
}