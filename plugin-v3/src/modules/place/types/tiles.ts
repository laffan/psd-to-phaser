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
  const psdData = plugin.getData(psdKey);
  if (!psdData || !psdData.basePath) {
    console.error(`Invalid PSD data for key: ${psdKey}`);
    resolve();
    return;
  }

  const tilesToLoad = tileData.columns * tileData.rows;
  let tilesLoaded = 0;

  for (let col = 0; col < tileData.columns; col++) {
    for (let row = 0; row < tileData.rows; row++) {
      const x = tileData.x + col * tileSliceSize;
      const y = tileData.y + row * tileSliceSize;
      const key = `${tileData.name}_tile_${col}_${row}`;

      if (scene.textures.exists(key)) {
        createTile(scene, x, y, key, tileData.initialDepth, group);
        tilesLoaded++;
        checkCompletion();
      } else {
        const tilePath = `${psdData.basePath}/tiles/${tileData.name}/${tileSliceSize}/${key}.${tileData.filetype || 'png'}`;
        scene.load.image(key, tilePath);
        scene.load.once(`filecomplete-image-${key}`, () => {
          createTile(scene, x, y, key, tileData.initialDepth, group);
          tilesLoaded++;
          checkCompletion();
        });
      }
    }
  }

  function checkCompletion() {
    if (tilesLoaded === tilesToLoad) {
      addDebugVisualization(scene, tileData, tileSliceSize, group, plugin);
      resolve();
    }
  }

  if (!scene.load.isLoading()) {
    scene.load.start();
  }
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
  if (plugin.isDebugEnabled('shape')) {
    const graphics = scene.add.graphics();
    graphics.lineStyle(2, 0xff0000, 1);
    graphics.strokeRect(tileData.x, tileData.y, tileData.columns * tileSliceSize, tileData.rows * tileSliceSize);
    group.add(graphics);
  }

  if (plugin.isDebugEnabled('label')) {
    const text = scene.add.text(tileData.x, tileData.y - 20, tileData.name, { fontSize: '16px', color: '#ff0000' });
    group.add(text);
  }
}