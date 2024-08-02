import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';
import { placeTiles } from './types/tiles';
import { placeSprites } from './types/sprites';
// import { placeZone } from './types/zones';
// import { placePoint } from './types/points';

export default function placeModule(plugin: PsdToPhaserPlugin) {
  return function place(scene: Phaser.Scene, psdKey: string, layerPath: string): Phaser.GameObjects.Group {
    const psdData = plugin.getData(psdKey);
    if (!psdData) {
      console.error(`No data found for key: ${psdKey}`);
      return scene.add.group();
    }

    const tileSliceSize = psdData.tile_slice_size || 150;
    const group = scene.add.group();

    const loadPromise = new Promise<void>((resolve) => {
      placeLayerRecursively(scene, psdData, layerPath, plugin, tileSliceSize, group, resolve, psdKey);
    });

    scene.load.once('complete', () => {
      loadPromise.then(() => {
        scene.events.emit('layerPlaced', layerPath);
      });
    });

    if (!scene.load.isLoading()) {
      scene.load.start();
    }

    return group;
  };
}

function placeLayerRecursively(
  scene: Phaser.Scene,
  psdData: any,
  layerPath: string,
  plugin: PsdToPhaserPlugin,
  tileSliceSize: number,
  group: Phaser.GameObjects.Group,
  resolve: () => void,
  psdKey: string
): void {
  const pathParts = layerPath.split('/');
  let currentData = psdData;

  for (const part of pathParts) {
    if (Array.isArray(currentData.layers)) {
      currentData = currentData.layers.find((layer: any) => layer.name === part);
    } else if (currentData.children) {
      currentData = currentData.children.find((child: any) => child.name === part);
    } else {
      currentData = null;
      break;
    }

    if (!currentData) break;
  }

  if (!currentData) {
    console.error(`No layer found with path: ${layerPath}`);
    resolve();
    return;
  }

  if (currentData.category === 'group') {
    if (Array.isArray(currentData.children)) {
      let childrenPlaced = 0;
      currentData.children.forEach((child: any) => {
        placeLayerRecursively(scene, { layers: [child] }, child.name, plugin, tileSliceSize, group, () => {
          childrenPlaced++;
          if (childrenPlaced === currentData.children.length) {
            resolve();
          }
        }, psdKey);
      });
    } else {
      resolve();
    }
  } else {
    switch (currentData.category) {
      case 'tileset':
        placeTiles(scene, currentData, plugin, tileSliceSize, group, resolve, psdKey);
        break;
      case 'sprite':
        placeSprites(scene, currentData, plugin, group, resolve, psdKey);
        break;
      // ... (other cases remain commented out for now)
      default:
        console.error(`Unknown layer category: ${currentData.category}`);
        resolve();
    }
  }
}