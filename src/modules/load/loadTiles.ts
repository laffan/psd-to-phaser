/**
 * Tile asset loading – queues individual tile slice images with Phaser's loader.
 *
 * Tilesets are large images that have been pre-sliced by psd-to-json into a
 * grid of smaller images (`tiles/<name>/<sliceSize>/<name>_tile_<col>_<row>.png`).
 *
 * @module load/loadTiles
 */

import type { TilesetLayer, TileLoadData } from '../../types';

/**
 * Load a single tile slice image.
 *
 * Checks whether the texture already exists before queuing to avoid
 * duplicate loads (important for lazy-load scenarios).
 *
 * @param scene - The Phaser scene
 * @param tileData - Tile identification (tileset name, column, row, file type)
 * @param basePath - Base path to the PSD assets folder
 * @param tileSliceSize - Pixel size of each tile slice
 * @param onComplete - Callback invoked when the tile finishes loading
 * @param debug - Whether to log loading events to the console
 *
 * @internal
 */
export function loadSingleTile(
  scene: Phaser.Scene,
  tileData: TileLoadData,
  basePath: string,
  tileSliceSize: number,
  onComplete: () => void,
  debug: boolean
): void {
  const key = `${tileData.tilesetName}_tile_${tileData.col}_${tileData.row}`;
  const filePath = `${basePath}/tiles/${tileData.tilesetName}/${tileSliceSize}/${key}.${tileData.filetype ?? 'png'}`;

  if (!scene.textures.exists(key) && !scene.textures.getTextureKeys().includes(key) && !scene.load.textureManager.exists(key)) {
    scene.load.image(key, filePath);

    scene.load.once(`filecomplete-image-${key}`, () => {
      onComplete();
      if (debug) {
        console.log(`🧩 Loaded tile: ${key} from ${filePath}`);
      }
    });

    scene.load.start();
  } else {
    onComplete();
    if (debug) {
      console.log(`Tile already loaded or loading: ${key}`);
    }
  }
}

/**
 * Queue all tile slices for an array of tilesets.
 *
 * Iterates every column/row combination for each tileset and delegates
 * to {@link loadSingleTile} for the actual load call.
 *
 * @param scene - The Phaser scene
 * @param tiles - Array of tileset layer definitions
 * @param basePath - Base path to the PSD assets folder
 * @param tileSliceSize - Pixel size of each tile slice
 * @param onProgress - Callback invoked each time a tile finishes loading
 * @param debug - Whether to log loading events to the console
 * @param remainingAssets - Mutable array tracking which tile keys are still pending
 *
 * @internal
 */
export function loadTiles(
  scene: Phaser.Scene,
  tiles: TilesetLayer[],
  basePath: string,
  tileSliceSize: number,
  onProgress: () => void,
  debug: boolean,
  remainingAssets: string[]
): void {
  tiles.forEach((tileset) => {
    for (let col = 0; col < tileset.columns; col++) {
      for (let row = 0; row < tileset.rows; row++) {
        const tileData: TileLoadData = {
          tilesetName: tileset.name,
          col,
          row,
          filetype: tileset.filetype,
        };

        const key = `${tileset.name}_tile_${col}_${row}`;
        remainingAssets.push(key);

        loadSingleTile(
          scene,
          tileData,
          basePath,
          tileSliceSize,
          () => {
            const index = remainingAssets.indexOf(key);
            if (index > -1) {
              remainingAssets.splice(index, 1);
            }
            onProgress();
          },
          debug
        );
      }
    }
  });
}