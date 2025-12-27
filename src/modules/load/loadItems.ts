// src/modules/load/loadItems.ts

import PsdToPhaserPlugin from '../../PsdToPhaser';
import { loadSprites } from './loadSprites';
import { loadTiles, loadSingleTile } from './loadTiles';

import type { CategorizedLayers, SpriteLayer, TileLoadData } from '../../types';

interface ExtendedCategorizedLayers extends CategorizedLayers {
  singleTiles?: TileLoadData[];
}

export function loadItems(
  scene: Phaser.Scene,
  key: string,
  data: ExtendedCategorizedLayers,
  plugin: PsdToPhaserPlugin
): void {
  const psdData = plugin.getData(key);
  if (!psdData || !psdData.basePath) {
    console.error(`Invalid PSD data for key: ${key}`);
    return;
  }

  const basePath = psdData.basePath;
  const tileSliceSize = psdData.original.tile_slice_size ?? 150;

  // Count assets to load
  const assetCounts = countAssets(data);
  const totalAssets = assetCounts.tiles + assetCounts.sprites + assetCounts.singleTiles + assetCounts.atlases;

  let loadedAssets = 0;
  const remainingAssets: string[] = [];

  if (plugin.isDebugEnabled('console')) {
    console.log(`Total assets to load: ${totalAssets}`);
    console.log(`Tiles to load: ${assetCounts.tiles}`);
    console.log(`Sprites to load: ${assetCounts.sprites}`);
    console.log(`Single tiles to load: ${assetCounts.singleTiles}`);
    console.log(`Atlases to load: ${assetCounts.atlases}`);
    console.log(`Tile slice size: ${tileSliceSize}`);
  }

  const updateProgress = () => {
    loadedAssets++;
    const progress = loadedAssets / totalAssets;
    scene.events.emit('psdLoadProgress', progress);

    if (plugin.isDebugEnabled('console')) {
      console.log(`⏳ Progress: ${loadedAssets} of ${totalAssets} ( ${(progress * 100).toFixed(2)}% )`);
    }

    if (loadedAssets === totalAssets) {
      scene.events.emit('psdLoadComplete');
      if (plugin.isDebugEnabled('console')) {
        console.log('All PSD assets loaded');
      }
    }
  };

  // Load tiles
  if (data.tiles && data.tiles.length > 0) {
    loadTiles(scene, data.tiles, basePath, tileSliceSize, updateProgress, plugin.isDebugEnabled('console'), remainingAssets);
  }

  // Load single tiles
  if (data.singleTiles && data.singleTiles.length > 0) {
    data.singleTiles.forEach((tileData) => {
      loadSingleTile(scene, tileData, basePath, tileSliceSize, updateProgress, plugin.isDebugEnabled('console'));
    });
  }

  // Load sprites
  if (data.sprites && data.sprites.length > 0) {
    loadSprites(scene, data.sprites, basePath, updateProgress, plugin.isDebugEnabled('console'));
  }

  if (!scene.load.isLoading()) {
    scene.load.start();
  }
}

interface AssetCounts {
  tiles: number;
  sprites: number;
  singleTiles: number;
  atlases: number;
}

function countAssets(data: ExtendedCategorizedLayers): AssetCounts {
  let tileCount = 0;
  let spriteCount = 0;
  let singleTileCount = 0;
  let atlasCount = 0;

  // Count tiles
  if (data.tiles) {
    data.tiles.forEach((tile) => {
      if (!tile.lazyLoad) {
        tileCount += tile.columns * tile.rows;
      }
    });
  }

  // Count single tiles
  if (data.singleTiles) {
    singleTileCount = data.singleTiles.length;
  }

  // Count sprites and atlases
  const countSpritesRecursively = (sprites: SpriteLayer[]) => {
    sprites.forEach((sprite) => {
      if (!sprite.lazyLoad) {
        if (sprite.type === 'atlas') {
          atlasCount++;
        } else if (sprite.type === 'spritesheet') {
          spriteCount += (sprite as { frame_count?: number }).frame_count ?? 1;
        } else {
          spriteCount++;
        }
      }
    });
  };

  if (data.sprites) {
    countSpritesRecursively(data.sprites);
  }

  return { tiles: tileCount, sprites: spriteCount, singleTiles: singleTileCount, atlases: atlasCount };
}