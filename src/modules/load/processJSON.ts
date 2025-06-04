// src/modules/load/processJSON.ts

import PsdToPhaserPlugin from '../../PsdToPhaser';
import { loadItems } from './loadItems'; // Renamed from loadAssetsFromJSON
import { LoadOptions } from './index';

export function processJSON(
  scene: Phaser.Scene,
  key: string,
  data: any,
  psdFolderPath: string,
  plugin: PsdToPhaserPlugin,
  options?: LoadOptions
): void {
  if (!data || !Array.isArray(data.layers)) {
    console.error(`Invalid or missing layers data for key: ${key}`);
    return;
  }

  const processedData = {
    original: JSON.parse(JSON.stringify(data)), // Clone of original data
    basePath: psdFolderPath,
    initialLoad: {
      sprites: [],
      tiles: [],
      zones: [],
      points: [],
      groups: [] 
    },
    lazyLoad: {
      sprites: [],
      tiles: [],
      zones: [],
      points: [],
      groups: [] 
    }
  };

  processLayersRecursively(data.layers, processedData, false, options?.lazyLoad);

  plugin.setData(key, processedData);

  if (plugin.isDebugEnabled('console')) {
    console.log(`Processed JSON for key "${key}":`, processedData);
  }

  loadItems(scene, key, processedData.initialLoad, plugin);
}

function processLayersRecursively(layers: any[], processedData: any, parentLazyLoad: boolean, lazyLoadOption?: boolean | string[]) {
  
  layers.forEach((layer: any) => {
    let isLazyLoad = parentLazyLoad || layer.lazyLoad === true;
    
    // Apply lazyLoad option from load() parameters
    if (lazyLoadOption !== undefined) {
      if (lazyLoadOption === true) {
        // Set all layers to lazyLoad
        isLazyLoad = true;
      } else if (Array.isArray(lazyLoadOption) && lazyLoadOption.includes(layer.name)) {
        // Set specific layers to lazyLoad
        isLazyLoad = true;
      }
    }
    
    const targetArray = isLazyLoad ? processedData.lazyLoad : processedData.initialLoad;

    switch (layer.category) {
      case 'tileset':
        targetArray.tiles.push(layer);
        break;
      case 'sprite':
        targetArray.sprites.push(layer);
        break;
      case 'zone':
        targetArray.zones.push(layer);
        break;
      case 'point':
        targetArray.points.push(layer);
        break;
      case 'group':
        targetArray.groups.push(layer);
        if (Array.isArray(layer.children)) {
          processLayersRecursively(layer.children, processedData, isLazyLoad, lazyLoadOption);
        }
        break;
    }
  });
}