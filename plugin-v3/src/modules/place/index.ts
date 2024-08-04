// src/modules/place/index.ts

import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';
import { placeTiles } from './types/tiles';
import { placeSprites } from './types/sprites';
import { placeZones } from './types/zones';
import { placePoints } from './types/points';
import { attachMethods } from '../shared/attachMethods';

export default function placeModule(plugin: PsdToPhaserPlugin) {
  return function place(scene: Phaser.Scene, psdKey: string, layerPath: string, options: { depth?: number } = {}): Phaser.GameObjects.GameObject | Phaser.GameObjects.Group {
    const psdData = plugin.getData(psdKey);
    if (!psdData) {
      console.error(`No data found for key: ${psdKey}`);
      return scene.add.group();
    }

    const tileSliceSize = psdData.tile_slice_size || 150;
    const group = scene.add.group();

    const targetLayer = findLayer(psdData.layers, layerPath.split('/'));
    if (!targetLayer) {
      console.error(`No layer found with path: ${layerPath}`);
      return group;
    }

    const placedObject = placeLayerImmediately(scene, targetLayer, plugin, tileSliceSize, group, psdKey, options);
    attachMethods(plugin, placedObject);
    
    scene.events.emit('layerPlaced', layerPath);
    
    return placedObject;
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

function placeLayerImmediately(
  scene: Phaser.Scene,
  layer: any,
  plugin: PsdToPhaserPlugin,
  tileSliceSize: number,
  group: Phaser.GameObjects.Group,
  psdKey: string,
  options: { depth?: number }
): Phaser.GameObjects.GameObject | Phaser.GameObjects.Group {
  if (layer.category === 'group') {
    if (Array.isArray(layer.children) && (options.depth === undefined || options.depth > 0)) {
      layer.children.forEach((child: any) => {
        const childObject = placeLayerImmediately(scene, child, plugin, tileSliceSize, group, psdKey, {
          ...options,
          depth: options.depth !== undefined ? options.depth - 1 : undefined
        });
        if (childObject instanceof Phaser.GameObjects.GameObject) {
          group.add(childObject);
        }
      });
      return group;
    }
    return group;
  } else {
    let placedObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group | null = null;
    switch (layer.category) {
      case 'tileset':
        placedObject = placeTiles(scene, layer, plugin, tileSliceSize, group, () => {}, psdKey);
        break;
      case 'sprite':
        placedObject = placeSprites(scene, layer, plugin, group, () => {}, psdKey);
        break;
      case 'zone':
        placedObject = placeZones(scene, layer, plugin, group, () => {}, psdKey);
        break;
      case 'point':
        placedObject = placePoints(scene, layer, plugin, group, () => {}, psdKey);
        break;
      default:
        console.error(`Unknown layer category: ${layer.category}`);
    }
    return placedObject || group;
  }
}