import PsdToPhaserPlugin from '../../../PsdToPhaserPlugin';

export function placeTiles(
  scene: Phaser.Scene,
  psdData: any,
  layerName: string,
  plugin: PsdToPhaserPlugin
): Phaser.GameObjects.Group {
  const layer = psdData.tiles.find((tile: any) => tile.name === layerName);
  if (!layer) {
    console.error(`No tile layer found with name: ${layerName}`);
    return scene.add.group(); // Return an empty group
  }

  const group = scene.add.group();
  const tileSliceSize = psdData.tile_slice_size;

  const checkAndPlace = () => {
    if (checkAllTilesLoaded(scene, layer)) {
      createTiles(scene, layer, tileSliceSize, group, plugin);
      addDebugVisualization(scene, layer, tileSliceSize, group, plugin);
    } else {
      // If not all tiles are loaded, check again in the next frame
      scene.time.delayedCall(0, checkAndPlace);
    }
  };

  checkAndPlace();

  return group;
}

function checkAllTilesLoaded(scene: Phaser.Scene, layer: any): boolean {
  for (let col = 0; col < layer.columns; col++) {
    for (let row = 0; row < layer.rows; row++) {
      const key = `${layer.name}_tile_${col}_${row}`;
      if (!scene.textures.exists(key)) {
        return false;
      }
    }
  }
  return true;
}

function createTiles(
  scene: Phaser.Scene,
  layer: any,
  tileSliceSize: number,
  group: Phaser.GameObjects.Group,
  plugin: PsdToPhaserPlugin
): void {
  for (let col = 0; col < layer.columns; col++) {
    for (let row = 0; row < layer.rows; row++) {
      const x = layer.x + col * tileSliceSize;
      const y = layer.y + row * tileSliceSize;
      const key = `${layer.name}_tile_${col}_${row}`;

      if (scene.textures.exists(key)) {
        const tile = scene.add.image(x, y, key);
        tile.setOrigin(0, 0);
        tile.setDepth(layer.initialDepth || 0);
        group.add(tile);

        if (plugin.isDebugEnabled('console')) {
          console.log(`Placed tile: ${key} at (${x}, ${y})`);
        }
      } else {
        console.warn(`Texture not found for tile: ${key}`);
      }
    }
  }
}

function addDebugVisualization(
  scene: Phaser.Scene,
  layer: any,
  tileSliceSize: number,
  group: Phaser.GameObjects.Group,
  plugin: PsdToPhaserPlugin
): void {
  if (plugin.isDebugEnabled('shape')) {
    const graphics = scene.add.graphics();
    graphics.lineStyle(2, 0xff0000, 1);
    graphics.strokeRect(layer.x, layer.y, layer.columns * tileSliceSize, layer.rows * tileSliceSize);
    group.add(graphics);
  }

  if (plugin.isDebugEnabled('label')) {
    const text = scene.add.text(layer.x, layer.y - 20, layer.name, { fontSize: '16px', color: '#ff0000' });
    group.add(text);
  }
}