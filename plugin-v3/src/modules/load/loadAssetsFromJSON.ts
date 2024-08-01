import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';
import { loadSprites } from './loadSprites';
import { loadTiles } from './loadTiles';

export function loadAssetsFromJSON(scene: Phaser.Scene, key: string, data: any, plugin: PsdToPhaserPlugin): void {
  const basePath = data.basePath;
  const spritesToLoad = data.sprites || [];
  const tilesToLoad = data.tiles || [];

  const totalAssets = spritesToLoad.length + tilesToLoad.length;
  let loadedAssets = 0;

  if (plugin.isDebugEnabled('console')) {
    console.log(`Total assets to load: ${totalAssets}`);
    console.log(`Sprites to load: ${spritesToLoad.length}`);
    console.log(`Tiles to load: ${tilesToLoad.length}`);
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

  if (spritesToLoad.length > 0) {
    loadSprites(scene, spritesToLoad, basePath, updateProgress, plugin.isDebugEnabled('console'));
  }

  if (tilesToLoad.length > 0) {
    loadTiles(scene, tilesToLoad, basePath, updateProgress, plugin.isDebugEnabled('console'));
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