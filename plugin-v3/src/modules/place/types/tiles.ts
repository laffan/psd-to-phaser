import PsdToPhaserPlugin from '../../../PsdToPhaserPlugin';

export function placeTiles(
  scene: Phaser.Scene,
  tileData: any,
  plugin: PsdToPhaserPlugin,
  tileSliceSize: number,
  group: Phaser.GameObjects.Group,
  resolve: () => void,
  psdKey: string
): void {
  for (let col = 0; col < tileData.columns; col++) {
    for (let row = 0; row < tileData.rows; row++) {
      const x = tileData.x + col * tileSliceSize;
      const y = tileData.y + row * tileSliceSize;
      const key = `${tileData.name}_tile_${col}_${row}`;

      placeSingleTile(scene, {
        x,
        y,
        key,
        initialDepth: tileData.initialDepth,
        tilesetName: tileData.name,
        col,
        row
      }, group);
    }
  }

  addDebugVisualization(scene, tileData, tileSliceSize, group, plugin);
  resolve();
}

export function placeSingleTile(
  scene: Phaser.Scene,
  tileData: {
    x: number,
    y: number,
    key: string,
    initialDepth: number,
    tilesetName: string,
    col: number,
    row: number
  },
  group: Phaser.GameObjects.Group
): Phaser.GameObjects.Image | null {
  if (scene.textures.exists(tileData.key)) {
    const tile = scene.add.image(tileData.x, tileData.y, tileData.key);
    tile.setOrigin(0, 0);
    tile.setDepth(tileData.initialDepth || 0);
    group.add(tile);
    console.log(`Placed tile: ${tileData.key} at (${tileData.x}, ${tileData.y})`);
    return tile;
  } else {
    console.warn(`Texture not found for tile: ${tileData.key}`);
    return null;
  }
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