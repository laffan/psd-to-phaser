// src/modules/load/initLoad.ts

import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';
import { loadSprites } from './loadSprites';
import { loadTiles } from './loadTiles';

export function initLoad(scene: Phaser.Scene, key: string, data: any, plugin: PsdToPhaserPlugin): void {
  const psdData = plugin.getData(key);
  if (!psdData || !psdData.basePath) {
    console.error(`Invalid PSD data for key: ${key}`);
    return;
  }
  

  const basePath = psdData.basePath;
  const tileSliceSize = psdData.original.tile_slice_size || 150;

  // Count assets to load
  const assetCounts = countAssets(data);
  const totalAssets = assetCounts.tiles + assetCounts.sprites;

  let loadedAssets = 0;
  const remainingAssets: string[] = [];

  if (plugin.isDebugEnabled('console')) {
    console.log(`Total assets to load: ${totalAssets}`);
    console.log(`Tiles to load: ${assetCounts.tiles}`);
    console.log(`Sprites to load: ${assetCounts.sprites}`);
    console.log(`Tile slice size: ${tileSliceSize}`);
  }

  const updateProgress = () => {
    loadedAssets++;
    const progress = loadedAssets / totalAssets;
    scene.events.emit('psdLoadProgress', progress);

    if (plugin.isDebugEnabled('console')) {
      console.log(`Loaded asset ${loadedAssets} of ${totalAssets}`);
      console.log(`Loading progress: ${(progress * 100).toFixed(2)}%`);
    }

    if (loadedAssets === totalAssets) {
      scene.events.emit('psdLoadComplete');
      if (plugin.isDebugEnabled('console')) {
        console.log('All initial PSD assets loaded');
      }
    }
  };

  // Load tiles
  if (data.tiles.length > 0) {
    loadTiles(scene, data.tiles, basePath, tileSliceSize, updateProgress, plugin.isDebugEnabled('console'), remainingAssets);
  }

  // Load sprites
  if (data.sprites.length > 0) {
    loadSprites(scene, data.sprites, basePath, updateProgress, plugin.isDebugEnabled('console'), remainingAssets);
  }

  if (!scene.load.isLoading()) {
    scene.load.start();
  }
}

function countAssets(data: any): { tiles: number, sprites: number } {
  let tileCount = 0;
  let spriteCount = 0;

  // Count tiles
  data.tiles.forEach((tile: any) => {
    if (!tile.lazyLoad) {
      tileCount += tile.columns * tile.rows;
    }
  });

  // Count sprites
  const countSpritesRecursively = (sprites: any[]) => {
    sprites.forEach((sprite: any) => {
      if (!sprite.lazyLoad) {
        if (sprite.type === 'atlas') {
          spriteCount += Object.keys(sprite.frames).length;
        } else if (sprite.type === 'spritesheet') {
          spriteCount += sprite.frame_count || 1;
        } else {
          spriteCount++;
        }
      }

      if (sprite.children) {
        countSpritesRecursively(sprite.children);
      }
    });
  };

  countSpritesRecursively(data.sprites);

  return { tiles: tileCount, sprites: spriteCount };
}

