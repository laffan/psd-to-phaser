// src/modules/load/loadSprites.ts

import type {
  SpriteLayer,
  AtlasSpriteLayer,
  SpritesheetLayer,
  AnimationSpriteLayer,
  AtlasJsonData,
} from '../../types';
import { hasMask } from '../../types';

export function loadSprites(
  scene: Phaser.Scene,
  sprites: SpriteLayer[],
  basePath: string,
  onProgress: () => void,
  debug: boolean
): Promise<void> {
  return new Promise((resolve) => {
    let spritesToLoad = sprites.length;
    sprites.forEach((sprite) => {
      const key = sprite.name;
      const filePath = `${basePath}/${sprite.filePath}`;
      const loadHandler = () => {
        spritesToLoad--;
        onProgress();
        if (spritesToLoad === 0) {
          resolve();
        }
      };

      // Also load mask if present
      if (hasMask(sprite)) {
        loadMaskImage(scene, sprite.name, basePath, sprite.maskPath, onProgress, debug);
      }

      if (sprite.type === "atlas") {
        loadAtlas(scene, key, filePath, sprite, loadHandler, debug);
      } else if (sprite.type === "spritesheet" || sprite.type === "animation") {
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

/**
 * Load a mask image for a layer
 */
export function loadMaskImage(
  scene: Phaser.Scene,
  layerName: string,
  basePath: string,
  maskPath: string,
  onProgress: () => void,
  debug: boolean
): void {
  const maskKey = `${layerName}_mask`;
  const fullMaskPath = `${basePath}/${maskPath}`;

  if (!scene.textures.exists(maskKey)) {
    scene.load.image(maskKey, fullMaskPath);
    scene.load.once(`filecomplete-image-${maskKey}`, () => {
      if (debug) {
        console.log(`🎭 Loaded mask: ${maskKey} from ${fullMaskPath}`);
      }
      onProgress();
    });
  } else {
    onProgress();
    if (debug) {
      console.log(`Mask already loaded: ${maskKey}`);
    }
  }
}

function loadAtlas(
  scene: Phaser.Scene,
  key: string,
  filePath: string,
  sprite: AtlasSpriteLayer,
  onProgress: () => void,
  debug: boolean
): void {
  console.log(`[${Date.now()}] Starting loadAtlas for key: ${key}`);

  const atlasData: AtlasJsonData = { frames: {} };
  Object.entries(sprite.frames).forEach(([frameName, frameData]) => {
    atlasData.frames[frameName] = {
      frame: {
        x: frameData.x,
        y: frameData.y,
        w: frameData.width,
        h: frameData.height,
      },
      rotated: false,
      trimmed: false,
      sourceSize: { w: frameData.width, h: frameData.height },
      spriteSourceSize: {
        x: 0,
        y: 0,
        w: frameData.width,
        h: frameData.height,
      },
    };
  });

  scene.load.atlas(key, filePath, atlasData);

  const checkAtlasLoaded = () => {
    if (scene.textures.exists(key)) {
      if (debug) {
        console.log(`🗺️ Loaded atlas: ${key} from ${filePath}`);
      }
      scene.load.off("complete", checkAtlasLoaded);
      onProgress();
    } else {
      setTimeout(checkAtlasLoaded, 100);
    }
  };

  scene.load.on("complete", checkAtlasLoaded);

  scene.load.on("loaderror", (fileObj: Phaser.Loader.File) => {
    console.error(`Error loading file: `, fileObj);
    scene.load.off("complete", checkAtlasLoaded);
  });
}

function loadSpritesheet(
  scene: Phaser.Scene,
  key: string,
  filePath: string,
  sprite: SpritesheetLayer | AnimationSpriteLayer,
  onProgress: () => void,
  debug: boolean
): void {
  scene.load.spritesheet(key, filePath, {
    frameWidth: sprite.frame_width,
    frameHeight: sprite.frame_height,
  });
  scene.load.once(`filecomplete-spritesheet-${key}`, () => {
    if (debug) {
      console.log(`💥 Loaded spritesheet: ${key} from ${filePath}`);
    }
    for (let i = 0; i < (sprite.frame_count ?? 1); i++) {
      onProgress();
    }
  });
}

function loadImage(
  scene: Phaser.Scene,
  key: string,
  filePath: string,
  onProgress: () => void,
  debug: boolean
) {
  scene.load.image(key, filePath);
  scene.load.once(`filecomplete-image-${key}`, () => {
    if (debug) {
      console.log(`🎑 Loaded image: ${key} from ${filePath}`);
    }
    onProgress();
  });
}
