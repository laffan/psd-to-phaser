// src/modules/load/loadItems.ts

import PsdToPhaserPlugin from '../../PsdToPhaser';
import { loadSprites, loadMaskImage } from './loadSprites';
import { loadTiles, loadSingleTile } from './loadTiles';

import type { CategorizedLayers, SpriteLayer, TileLoadData } from '../../types';
import { hasMask } from '../../types';

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
  const totalAssets = assetCounts.tiles + assetCounts.sprites + assetCounts.singleTiles + assetCounts.atlases + assetCounts.masks;

  let loadedAssets = 0;
  const remainingAssets: string[] = [];

  if (plugin.isDebugEnabled('console')) {
    console.log(`Total assets to load: ${totalAssets}`);
    console.log(`Tiles to load: ${assetCounts.tiles}`);
    console.log(`Sprites to load: ${assetCounts.sprites}`);
    console.log(`Single tiles to load: ${assetCounts.singleTiles}`);
    console.log(`Atlases to load: ${assetCounts.atlases}`);
    console.log(`Masks to load: ${assetCounts.masks}`);
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

  // Load sprites (loadSprites also handles sprite masks internally)
  if (data.sprites && data.sprites.length > 0) {
    loadSprites(scene, data.sprites, basePath, updateProgress, plugin.isDebugEnabled('console'));
  }

  // Load masks for tiles
  if (data.tiles && data.tiles.length > 0) {
    data.tiles.forEach((tile) => {
      if (!tile.lazyLoad && hasMask(tile)) {
        loadMaskImage(scene, tile.name, basePath, tile.maskPath, updateProgress, plugin.isDebugEnabled('console'));
      }
    });
  }

  // Load masks for groups
  if (data.groups && data.groups.length > 0) {
    data.groups.forEach((group) => {
      if (hasMask(group)) {
        loadMaskImage(scene, group.name, basePath, group.maskPath, updateProgress, plugin.isDebugEnabled('console'));
      }
    });
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
  masks: number;
}

function countAssets(data: ExtendedCategorizedLayers): AssetCounts {
  let tileCount = 0;
  let spriteCount = 0;
  let singleTileCount = 0;
  let atlasCount = 0;
  let maskCount = 0;

  // Count tiles and their masks
  if (data.tiles) {
    data.tiles.forEach((tile) => {
      if (!tile.lazyLoad) {
        tileCount += tile.columns * tile.rows;
        if (hasMask(tile)) {
          maskCount++;
        }
      }
    });
  }

  // Count single tiles
  if (data.singleTiles) {
    singleTileCount = data.singleTiles.length;
  }

  // Count sprites, atlases, and their masks
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
        // Count sprite masks
        if (hasMask(sprite)) {
          maskCount++;
        }
      }
    });
  };

  if (data.sprites) {
    countSpritesRecursively(data.sprites);
  }

  // Count group masks
  if (data.groups) {
    data.groups.forEach((group) => {
      if (hasMask(group)) {
        maskCount++;
      }
    });
  }

  return { tiles: tileCount, sprites: spriteCount, singleTiles: singleTileCount, atlases: atlasCount, masks: maskCount };
}