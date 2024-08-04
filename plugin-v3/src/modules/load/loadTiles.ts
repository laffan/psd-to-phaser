export function loadTiles(
  scene: Phaser.Scene,
  tiles: any[],
  basePath: string,
  tileSliceSize: number,
  onProgress: () => void,
  debug: boolean,
  remainingAssets: string[]
): void {
  tiles.forEach(tileset => {
    for (let col = 0; col < tileset.columns; col++) {
      for (let row = 0; row < tileset.rows; row++) {
        const key = `${tileset.name}_tile_${col}_${row}`;
        const filePath = `${basePath}/tiles/${tileset.name}/${tileSliceSize}/${key}.${tileset.filetype || 'png'}`;

        if (!scene.textures.exists(key) && !scene.textures.getTextureKeys().includes(key) && !scene.load.textureManager.exists(key)) {
          scene.load.image(key, filePath);
          remainingAssets.push(key);

          scene.load.once(`filecomplete-image-${key}`, () => {
            const index = remainingAssets.indexOf(key);
            if (index > -1) {
              remainingAssets.splice(index, 1);
            }
            onProgress();
            if (debug) {
              console.log(`Loaded tile: ${key} from ${filePath}`);
            }
          });

          if (debug) {
            console.log(`Queued tile for loading: ${key} from ${filePath}`);
          }
        } else {
          onProgress();
          if (debug) {
            console.log(`Tile already loaded or loading: ${key}`);
          }
        }
      }
    }
  });
}