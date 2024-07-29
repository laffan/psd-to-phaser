// src/modules/load/loadTiles.ts

export function loadTiles(scene: Phaser.Scene, tiles: any[], onProgress: () => void, debug: boolean): void {
  tiles.forEach(({ key, path, lazyLoad }) => {
    if (lazyLoad) {
      // Skip loading lazy-loaded tiles
      if (debug) {
        console.log(`Skipping lazy-load tile: ${key}`);
      }
      return;
    }

    scene.load.image(key, path);

    scene.load.once(`filecomplete-image-${key}`, () => {
      onProgress();
      if (debug) {
        console.log(`Loaded tile: ${key} from ${path}`);
      }
    });

    if (debug) {
      console.log(`Queued tile for loading: ${key} from ${path}`);
    }
  });
}