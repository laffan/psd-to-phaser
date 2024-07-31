// src/modules/load/loadAssetsFromJSON.ts

import { loadSprites } from './loadSprites';
import { loadTiles } from './loadTiles';
import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';

export function loadAssetsFromJSON(scene: Phaser.Scene, key: string, data: any, plugin: PsdToPhaserPlugin): void {
  const basePath = data.basePath;
  const spritesToLoad = data.sprites || [];
  const tilesToLoad = getTilesToLoad(data.tiles, basePath);

  const totalAssets = spritesToLoad.length + tilesToLoad.length;
  let loadedAssets = 0;

  if (plugin.options.debug) {
    console.log(`Total assets to load: ${totalAssets}`);
    console.log(`Sprites to load: ${spritesToLoad.length}`);
    console.log(`Tiles to load: ${tilesToLoad.length}`);
  }

  const updateProgress = () => {
    loadedAssets++;
    const progress = loadedAssets / totalAssets;
    scene.events.emit('psdLoadProgress', progress);

    if (plugin.options.debug) {
      console.log(`Loaded asset ${loadedAssets} of ${totalAssets}`);
      console.log(`Loading progress: ${(progress * 100).toFixed(2)}%`);
    }

    if (loadedAssets === totalAssets) {
      scene.events.emit('psdLoadComplete');
      if (plugin.options.debug) {
        console.log('All PSD assets loaded');
      }
    }
  };

  if (spritesToLoad.length > 0) {
    loadSprites(scene, spritesToLoad, basePath, updateProgress, plugin.options.debug);
  }

  if (tilesToLoad.length > 0) {
    loadTiles(scene, tilesToLoad, updateProgress, plugin.options.debug);
  }

  if (totalAssets === 0) {
    scene.events.emit('psdLoadComplete');
    if (plugin.options.debug) {
      console.log('No assets to load');
    }
  }

  if (!scene.load.isLoading()) {
    scene.load.start();
  }
}

function getTilesToLoad(tiles: any[], basePath: string): any[] {
  if (!tiles || tiles.length === 0) return [];

  return tiles.flatMap((tileLayer: any) => {
    if (tileLayer.lazyLoad) return [];

    const tileSize = tileLayer.tile_slice_size;
    const fileExtension = tileLayer.filetype || 'png';

    const tilesForLayer = [];
    for (let col = 0; col < tileLayer.columns; col++) {
      for (let row = 0; row < tileLayer.rows; row++) {
        const tileKey = `${tileLayer.name}_tile_${col}_${row}`;
        const tilePath = `${basePath}/${tileLayer.path}/${tileKey}.${fileExtension}`;
        tilesForLayer.push({ key: tileKey, path: tilePath });
      }
    }
    return tilesForLayer;
  });
}




function isLazyLoaded(obj: any): boolean {
  return obj.lazyLoad === true;
}