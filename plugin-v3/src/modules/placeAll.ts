import PsdToPhaserPlugin from '../PsdToPhaserPlugin';
import { attachMethods } from './shared/attachMethods';

import { placeTiles } from './place/types/tiles';
import { placeSprites } from './place/types/sprites';
import { placeZones } from './place/types/zones';
import { placePoints } from './place/types/points';

export default function placeAllModule(plugin: PsdToPhaserPlugin) {
  return function placeAll(scene: Phaser.Scene, psdKey: string): Phaser.GameObjects.Group {
    const psdData = plugin.getData(psdKey);
    if (!psdData) {
      console.error(`No data found for key: ${psdKey}`);
      return scene.add.group();
    }

    const group = scene.add.group();
    const tileSliceSize = psdData.tile_slice_size || 150;

    // Flatten the layer structure
    const flatLayers = flattenLayers(psdData.layers);

    // Place each layer
    flatLayers.forEach((layer) => {
      placeLayer(scene, layer, plugin, tileSliceSize, group, psdKey);
    });

    attachMethods(plugin, group);


    scene.events.emit('allLayersPlaced');
    return group;
  };
}

function flattenLayers(layers: any[]): any[] {
  return layers.reduce((acc, layer) => {
    if (layer.category === 'group' && Array.isArray(layer.children)) {
      return [...acc, layer, ...flattenLayers(layer.children)];
    }
    return [...acc, layer];
  }, []);
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
      // Groups are already flattened, so we don't need to do anything
      break;
    default:
      console.warn(`Unknown layer category: ${layer.category}`);
  }
}