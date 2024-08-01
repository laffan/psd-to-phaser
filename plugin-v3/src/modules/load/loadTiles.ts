export function loadTiles(
  scene: Phaser.Scene,
  tiles: any[],
  basePath: string,
  tileSliceSize: number,
  onProgress: () => void,
  debug: boolean
): void {
  tiles.forEach(tileset => {
    for (let col = 0; col < tileset.columns; col++) {
      for (let row = 0; row < tileset.rows; row++) {
        const key = `${tileset.name}_tile_${col}_${row}`;
        const filePath = `${basePath}/tiles/${tileset.name}/${tileSliceSize}/${key}.${tileset.filetype || 'png'}`;

        scene.load.image(key, filePath);

        scene.load.once(`filecomplete-image-${key}`, () => {
          onProgress();
          if (debug) {
            console.log(`Loaded tile: ${key} from ${filePath}`);
          }
        });

        if (debug) {
          console.log(`Queued tile for loading: ${key} from ${filePath}`);
        }
      }
    }
  });
}