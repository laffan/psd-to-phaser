import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';
import { loadAssetsFromJSON } from './loadAssetsFromJSON';

export function processJSON(
  scene: Phaser.Scene,
  key: string,
  data: any,
  psdFolderPath: string,
  plugin: PsdToPhaserPlugin
): void {
  if (!data || !Array.isArray(data.layers)) {
    console.error(`Invalid or missing layers data for key: ${key}`);
    return;
  }

  const processedData = {
    ...data,
    basePath: psdFolderPath,
    sprites: [],
    tiles: [],
    zones: [],
    points: [],
    lazyLoadObjects: []
  };

  processLayersRecursively(data.layers, processedData);

  plugin.setData(key, processedData);

  if (plugin.isDebugEnabled('console')) {
    console.log(`Processed JSON for key "${key}":`, processedData);
  }

  loadAssetsFromJSON(scene, key, processedData, plugin);
}

function processLayersRecursively(layers: any[], processedData: any) {
  layers.forEach((layer: any) => {
    switch (layer.category) {
      case 'tileset':
        processedData.tiles.push(layer);
        if (layer.lazyLoad) {
          processedData.lazyLoadObjects.push({ ...layer, type: 'tile' });
        }
        break;
      case 'sprite':
        processedData.sprites.push(layer);
        if (layer.lazyLoad) {
          processedData.lazyLoadObjects.push({ ...layer, type: 'sprite' });
        }
        break;
      case 'zone':
        processedData.zones.push(layer);
        break;
      case 'point':
        processedData.points.push(layer);
        break;
      case 'group':
        if (Array.isArray(layer.children)) {
          processLayersRecursively(layer.children, processedData);
        }
        break;
    }
  });
}