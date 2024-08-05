import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';
import { loadSprites } from './loadSprites';
import { loadTiles } from './loadTiles';

export function loadAssetsFromJSON(scene: Phaser.Scene, key: string, data: any, plugin: PsdToPhaserPlugin): void {
  if (!data || typeof data !== 'object') {
    console.error(`Invalid data for key: ${key}`);
    return;
  }

  const basePath = data.basePath || '';
  const tileSliceSize = data.tile_slice_size || 150;

  // Count tileset assets
  const tilesToLoad = Array.isArray(data.tiles) ? data.tiles.reduce((count, tile) => {
    if (tile.lazyLoad) return count;
    return count + (tile.columns * tile.rows);
  }, 0) : 0;

  // Count sprite assets
  const spritesToLoad = Array.isArray(data.sprites) ? data.sprites.filter(sprite => !sprite.lazyLoad).length : 0;

  const totalAssets = tilesToLoad + spritesToLoad;
  let loadedAssets = 0;
  const remainingAssets: string[] = [];

  if (plugin.isDebugEnabled('console')) {
    console.log(`Total assets to load: ${totalAssets}`);
    console.log(`Tiles to load: ${tilesToLoad}`);
    console.log(`Sprites to load: ${spritesToLoad}`);
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
        console.log('All PSD assets loaded');
      }
    }
  };

  if (data.tiles && data.tiles.length > 0) {
    loadTiles(scene, data.tiles, basePath, tileSliceSize, updateProgress, plugin.isDebugEnabled('console'), remainingAssets);
  }

  if (data.sprites && data.sprites.length > 0) {
    loadSprites(scene, data.sprites, basePath, updateProgress, plugin.isDebugEnabled('console'), remainingAssets);
  }

  if (totalAssets === 0) {
    scene.events.emit('psdLoadComplete');
    if (plugin.isDebugEnabled('console')) {
      console.log('No assets to load');
    }
  }

  if (!scene.load.isLoading()) {
    scene.load.start();
  }
}