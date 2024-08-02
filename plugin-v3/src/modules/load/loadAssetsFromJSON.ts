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

  // Only load tiles that aren't already loaded
  const tilesToLoad = Array.isArray(data.tiles) ? data.tiles.filter((tile: any) => {
    if (tile.lazyLoad) return false;
    for (let col = 0; col < tile.columns; col++) {
      for (let row = 0; row < tile.rows; row++) {
        const tileKey = `${tile.name}_tile_${col}_${row}`;
        if (!scene.textures.exists(tileKey)) return true;
      }
    }
    return false;
  }) : [];

  const spritesToLoad = Array.isArray(data.sprites) ? data.sprites.filter((sprite: any) => !sprite.lazyLoad && !scene.textures.exists(sprite.name)) : [];

  const totalAssets = spritesToLoad.length + tilesToLoad.reduce((count, tile) => count + (tile.columns * tile.rows), 0);
  let loadedAssets = 0;

  if (plugin.isDebugEnabled('console')) {
    console.log(`Total assets to load: ${totalAssets}`);
    console.log(`Sprites to load: ${spritesToLoad.length}`);
    console.log(`Tiles to load: ${tilesToLoad.length}`);
    console.log(`Tile slice size: ${tileSliceSize}`);
  }

  const updateProgress = () => {
    loadedAssets++;
    const progress = totalAssets > 0 ? loadedAssets / totalAssets : 1;
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

  if (spritesToLoad.length > 0) {
    loadSprites(scene, spritesToLoad, basePath, updateProgress, plugin.isDebugEnabled('console'));
  }

  if (tilesToLoad.length > 0) {
    loadTiles(scene, tilesToLoad, basePath, tileSliceSize, updateProgress, plugin.isDebugEnabled('console'));
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