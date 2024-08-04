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

      const layer = findLayer(psdData.layers, layerPath.split('/'));
      if (layer) {
        placeLayers(scene, [layer], plugin, tileSliceSize, group, psdKey, options.depth || Infinity, 1);
        scene.events.emit('layerPlaced', layerPath);
        resolve(group);
      } else {
        console.error(`No layer found with path: ${layerPath}`);
        resolve(group);
      }
    });
  };
}

function findLayer(layers: any[], pathParts: string[]): any | null {
  const [current, ...rest] = pathParts;
  const found = layers.find(layer => layer.name === current);

  if (!found) return null;
  if (rest.length === 0) return found;
  if (found.category === 'group' && Array.isArray(found.children)) {
    return findLayer(found.children, rest);
  }
  return null;
}

function placeLayers(
  scene: Phaser.Scene,
  layers: any[],
  plugin: PsdToPhaserPlugin,
  tileSliceSize: number,
  group: Phaser.GameObjects.Group,
  psdKey: string,
  maxDepth: number,
  currentDepth: number
): void {
  layers.forEach((layer) => {
    placeLayer(scene, layer, plugin, tileSliceSize, group, psdKey);

    if (layer.category === 'group' && Array.isArray(layer.children) && currentDepth < maxDepth) {
      const subGroup = scene.add.group();
      group.add(subGroup);
      placeLayers(scene, layer.children, plugin, tileSliceSize, subGroup, psdKey, maxDepth, currentDepth + 1);
    }
  });
}

function placeLayer(
  scene: Phaser.Scene,
  layer: any,
  plugin: PsdToPhaserPlugin,
  tileSliceSize: number,
  group: Phaser.GameObjects.Group,
  psdKey: string
): void {
  switch (layer.category) {
    case 'tileset':
      placeTiles(scene, layer, plugin, tileSliceSize, group, () => {}, psdKey);
      break;
    case 'sprite':
      placeSprites(scene, layer, plugin, group, () => {}, psdKey);
      break;
    case 'zone':
      placeZones(scene, layer, plugin, group, () => {}, psdKey);
      break;
    case 'point':
      placePoints(scene, layer, plugin, group, () => {}, psdKey);
      break;
    case 'group':
      // Groups are handled in placeLayers
      break;
    default:
      console.warn(`Unknown layer category: ${layer.category}`);
  }
}
