// src/modules/placeAll.ts

import PsdToPhaserPlugin from '../PsdToPhaserPlugin';
import { placeTiles } from './place/types/tiles';
import { placeSprites } from './place/types/sprites';
import { placeZones } from './place/types/zones';
import { placePoints } from './place/types/points';

export default function placeAllModule(plugin: PsdToPhaserPlugin) {
  return function placeAll(scene: Phaser.Scene, psdKey: string, options: { depth?: number } = {}): Phaser.GameObjects.Group {
    const psdData = plugin.getData(psdKey);
    if (!psdData) {
      console.error(`No data found for key: ${psdKey}`);
      return scene.add.group();
    }

    const group = scene.add.group();
    const tileSliceSize = psdData.tile_slice_size || 150;

    // Place layers
    placeLayers(scene, psdData.layers, plugin, tileSliceSize, group, psdKey, options.depth || Infinity, 1);

    scene.events.emit('allLayersPlaced');
    return group;
  };
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