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

    if (sprite.type === 'atlas') {
      // Load atlas using Phaser's built-in atlas loading
      const atlasData = { frames: {} };
      Object.entries(sprite.frames).forEach(([frameName, frameData]: [string, any]) => {
        atlasData.frames[frameName] = {
          frame: { x: frameData.x, y: frameData.y, w: frameData.width, h: frameData.height },
          rotated: false,
          trimmed: false,
          sourceSize: { w: frameData.width, h: frameData.height },
          spriteSourceSize: { x: 0, y: 0, w: frameData.width, h: frameData.height }
        };
      });
      scene.load.atlas(key, filePath, atlasData);
      scene.load.once(`filecomplete-atlas-${key}`, () => {
        onProgress();
        if (debug) {
          console.log(`Loaded atlas: ${key} from ${filePath}`);
          const frames = scene.textures.get(key).getFrameNames();
          console.log(`Frames in atlas ${key}:`, frames);
        }
      });
    } else if (sprite.type === 'animation' || sprite.type === 'spritesheet') {
      scene.load.spritesheet(key, filePath, {
        frameWidth: sprite.frame_width,
        frameHeight: sprite.frame_height
      });
      scene.load.once(`filecomplete-spritesheet-${key}`, onProgress);
    } else {
      scene.load.image(key, filePath);
      scene.load.once(`filecomplete-image-${key}`, onProgress);
    }

    if (debug) {
      console.log(`Queued sprite for loading: ${key} from ${filePath}`);
    }
  });
}