export function loadTiles(scene: Phaser.Scene, tiles: any[], onProgress: () => void, debug: boolean): { loadedTiles: any[], lazyTiles: any[] } {
  const loadedTiles: any[] = [];
  const lazyTiles: any[] = [];

  tiles.forEach((tile) => {
    if (tile.lazyLoad) {
      lazyTiles.push(tile);
      if (debug) {
        console.log(`Queued lazy-load tile: ${tile.key}`);
      }
    } else {
      loadedTiles.push(tile);
      scene.load.image(tile.key, tile.path);
      scene.load.once(`filecomplete-image-${tile.key}`, () => {
        onProgress();
        if (debug) {
          console.log(`Loaded tile: ${tile.key} from ${tile.path}`);
        }
      });
      if (debug) {
        console.log(`Queued tile for loading: ${tile.key} from ${tile.path}`);
      }
    }
  });

  return { loadedTiles, lazyTiles };
}