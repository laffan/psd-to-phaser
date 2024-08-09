// src/modules/load/loadSprites.ts

export function loadSprites(
  scene: Phaser.Scene,
  sprites: any[],
  basePath: string,
  onProgress: () => void,
  debug: boolean
): Promise<void> {
  return new Promise((resolve) => {
    let spritesToLoad = sprites.length;
    sprites.forEach(sprite => {

      const key = sprite.name;
      const filePath = `${basePath}/${sprite.filePath}`;

      const loadHandler = () => {
        spritesToLoad--;
        onProgress();
        if (spritesToLoad === 0) {
          resolve();
        }
      };

      if (sprite.type === 'atlas') {
        loadAtlas(scene, key, filePath, sprite, loadHandler, debug);
      } else if (sprite.type === 'spritesheet' || sprite.type === 'animation') {
        loadSpritesheet(scene, key, filePath, sprite, loadHandler, debug);
      } else {
        loadImage(scene, key, filePath, loadHandler, debug);
      }
    });

    if (spritesToLoad === 0) {
      resolve();
    }
  });
}

function loadAtlas(scene: Phaser.Scene, key: string, filePath: string, sprite: any, onProgress: () => void, debug: boolean) {
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
    if (debug) {
      console.log(`Loaded atlas: ${key} from ${filePath}`);
      const frames = scene.textures.get(key).getFrameNames();
      console.log(`Frames in atlas ${key}:`, frames);
    }
    for (let i = 0; i < Object.keys(sprite.frames).length; i++) {
      onProgress();
    }
  });
}

function loadSpritesheet(scene: Phaser.Scene, key: string, filePath: string, sprite: any, onProgress: () => void, debug: boolean) {
  scene.load.spritesheet(key, filePath, {
    frameWidth: sprite.frame_width,
    frameHeight: sprite.frame_height
  });
  scene.load.once(`filecomplete-spritesheet-${key}`, () => {
    if (debug) {
      console.log(`Loaded spritesheet: ${key} from ${filePath}`);
    }
    for (let i = 0; i < (sprite.frame_count || 1); i++) {
      onProgress();
    }
  });
}

function loadImage(scene: Phaser.Scene, key: string, filePath: string, onProgress: () => void, debug: boolean) {
  scene.load.image(key, filePath);
  scene.load.once(`filecomplete-image-${key}`, () => {
    if (debug) {
      console.log(`Loaded image: ${key} from ${filePath}`);

    }
    onProgress();
  });
}