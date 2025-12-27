// src/modules/load/loadTiles.ts

import type { TilesetLayer, TileLoadData } from '../../types';

// Function to load a single tile
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

// Function to load multiple tiles (for normal loading)
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