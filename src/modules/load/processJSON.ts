/**
 * JSON processing – parses a PSD document manifest and categorises its layers.
 *
 * @module load/processJSON
 */

import PsdToPhaserPlugin from '../../PsdToPhaser';
import { loadItems } from './loadItems';

import type {
  PsdDocument,
  PsdLayer,
  ProcessedPsdData,
  LoadOptions,
} from '../../types';
import {
  isSpriteLayer,
  isTilesetLayer,
  isZoneLayer,
  isPointLayer,
  isGroupLayer,
} from '../../types';

/**
 * Parse a raw PSD JSON document and split its layers into `initialLoad`
 * and `lazyLoad` buckets based on layer attributes and caller options.
 *
 * After categorisation the initial-load assets are queued via {@link loadItems}.
 *
 * @param scene - The Phaser scene
 * @param key - PSD key for storage in the plugin
 * @param data - The raw PSD document from `data.json`
 * @param psdFolderPath - Base path to the asset folder
 * @param plugin - Plugin instance
 * @param options - Optional load configuration (lazyLoad settings)
 *
 * @internal
 */
export function processJSON(
  scene: Phaser.Scene,
  key: string,
  data: PsdDocument,
  psdFolderPath: string,
  plugin: PsdToPhaserPlugin,
  options?: LoadOptions
): void {
  if (!data || !Array.isArray(data.layers)) {
    console.error(`Invalid or missing layers data for key: ${key}`);
    return;
  }

  const processedData: ProcessedPsdData = {
    original: JSON.parse(JSON.stringify(data)),
    basePath: psdFolderPath,
    initialLoad: {
      sprites: [],
      tiles: [],
      zones: [],
      points: [],
      groups: [],
    },
    lazyLoad: {
      sprites: [],
      tiles: [],
      zones: [],
      points: [],
      groups: [],
    },
  };

  processLayersRecursively(data.layers, processedData, false, options?.lazyLoad);

  plugin.setData(key, processedData);

  if (plugin.isDebugEnabled('console')) {
    console.log(`Processed JSON for key "${key}":`, processedData);
  }

  loadItems(scene, key, processedData.initialLoad, plugin);
}

/**
 * Walk the layer tree, assigning each leaf to the correct load bucket.
 *
 * A layer is marked lazy when any of the following are true:
 * 1. Its parent was already lazy (`parentLazyLoad`)
 * 2. It has `lazyLoad: true` in its PSD attributes
 * 3. The caller passed `lazyLoad: true` or included its name in the array
 *
 * @internal
 */
function processLayersRecursively(
  layers: PsdLayer[],
  processedData: ProcessedPsdData,
  parentLazyLoad: boolean,
  lazyLoadOption?: boolean | string[]
): void {
  layers.forEach((layer) => {
    let isLazyLoad = parentLazyLoad || layer.attributes?.lazyLoad === true;

    // Apply lazyLoad option from load() parameters
    if (lazyLoadOption !== undefined) {
      if (lazyLoadOption === true) {
        isLazyLoad = true;
      } else if (Array.isArray(lazyLoadOption) && lazyLoadOption.includes(layer.name)) {
        isLazyLoad = true;
      }
    }

    const target = isLazyLoad ? processedData.lazyLoad : processedData.initialLoad;

    if (isTilesetLayer(layer)) {
      target.tiles.push(layer);
    } else if (isSpriteLayer(layer)) {
      target.sprites.push(layer);
    } else if (isZoneLayer(layer)) {
      target.zones.push(layer);
    } else if (isPointLayer(layer)) {
      target.points.push(layer);
    } else if (isGroupLayer(layer)) {
      target.groups.push(layer);
      processLayersRecursively(layer.children, processedData, isLazyLoad, lazyLoadOption);
    }
  });
}