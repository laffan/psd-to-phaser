export function loadSprites(
  scene: Phaser.Scene,
  sprites: any[],
  basePath: string,
  onProgress: () => void,
  debug: boolean
): void {
  sprites.forEach(sprite => {
    const key = sprite.name;
    const filePath = `${basePath}/${sprite.filePath}`;

    scene.load.image(key, filePath);

    scene.load.once(`filecomplete-image-${key}`, () => {
      onProgress();
      if (debug) {
        console.log(`Loaded sprite: ${key} from ${filePath}`);
      }
    });

    if (debug) {
      console.log(`Queued sprite for loading: ${key} from ${filePath}`);
    }
  });
}