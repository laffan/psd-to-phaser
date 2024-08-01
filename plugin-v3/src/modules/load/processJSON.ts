import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';
// import { loadAssetsFromJSON } from './loadAssetsFromJSON';

export function processJSON(
  scene: Phaser.Scene,
  key: string,
  data: any,
  psdFolderPath: string,
  plugin: PsdToPhaserPlugin
): void {
  if (!data || !data.layers || !Array.isArray(data.layers)) {
    console.error(`Invalid or missing layers data for key: ${key}`);
    return;
  }

  const processedData = {
    ...data,
    basePath: psdFolderPath,
    tiles: extractTiles(data.layers),
    sprites: extractSprites(data.layers),
    zones: extractZones(data.layers),
    points: extractPoints(data.layers),
    lazyLoadObjects: extractLazyLoadObjects(data.layers),
  };

  plugin.setData(key, processedData);

  if (plugin.isDebugEnabled('console')) {
    console.log(`Processed JSON for key "${key}":`, processedData);
  }

  // Commented out for now to prevent build errors
  // loadAssetsFromJSON(scene, key, processedData, plugin);

  // Temporary: Emit psdLoadComplete event
  scene.events.emit('psdLoadComplete');
}

function extractTiles(layers: any[]): any[] {
  return layers.filter(layer => layer.category === 'tileset' && !layer.lazyLoad);
}

function extractSprites(layers: any[]): any[] {
  return layers.filter(layer => layer.category === 'sprite' && !layer.lazyLoad);
}

function extractZones(layers: any[]): any[] {
  return layers.filter(layer => layer.category === 'zone');
}

function extractPoints(layers: any[]): any[] {
  return layers.filter(layer => layer.category === 'point');
}

function extractLazyLoadObjects(layers: any[]): any[] {
  return layers.filter(layer => layer.lazyLoad);
}