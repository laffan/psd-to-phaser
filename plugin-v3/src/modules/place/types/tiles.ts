import PsdToPhaserPlugin from '../../../PsdToPhaserPlugin';
import { createLazyLoadPlaceholder } from '../../shared/lazyLoadUtils';

export function placeTiles(
  scene: Phaser.Scene,
  tileData: any,
  plugin: PsdToPhaserPlugin,
  tileSliceSize: number,
  group: Phaser.GameObjects.Group,
  resolve: () => void,
  psdKey: string
): void {
  if (tileData.lazyLoad) {
    createLazyLoadPlaceholder(scene, tileData, plugin, group);
    resolve();
    return;
  }

  for (let col = 0; col < tileData.columns; col++) {
    for (let row = 0; row < tileData.rows; row++) {
      const x = tileData.x + col * tileSliceSize;
      const y = tileData.y + row * tileSliceSize;
      const key = `${tileData.name}_tile_${col}_${row}`;

      if (scene.textures.exists(key)) {
        createTile(scene, x, y, key, tileData.initialDepth, group);
      } else {
        console.warn(`Texture not found for tile: ${key}`);
      }
    }
  }

  addDebugVisualization(scene, tileData, tileSliceSize, group, plugin);
  resolve();
}

function createTile(scene: Phaser.Scene, x: number, y: number, key: string, depth: number, group: Phaser.GameObjects.Group) {
  const tile = scene.add.image(x, y, key);
  tile.setOrigin(0, 0);
  tile.setDepth(depth || 0);
  group.add(tile);
}

function addDebugVisualization(
  scene: Phaser.Scene,
  tileData: any,
  tileSliceSize: number,
  group: Phaser.GameObjects.Group,
  plugin: PsdToPhaserPlugin
): void {
  const debugDepth = 1000;

  if (plugin.isDebugEnabled('shape')) {
    const graphics = scene.add.graphics();
    graphics.setDepth(debugDepth);
    graphics.lineStyle(2, 0xff0000, 1);
    graphics.strokeRect(tileData.x, tileData.y, tileData.columns * tileSliceSize, tileData.rows * tileSliceSize);
    group.add(graphics);
  }

  if (plugin.isDebugEnabled('label')) {
    const text = scene.add.text(tileData.x, tileData.y - 20, tileData.name, { 
      fontSize: '16px', 
      color: '#ff0000',
      backgroundColor: '#ffffff'
    });
    text.setDepth(debugDepth);
    group.add(text);
  }
}