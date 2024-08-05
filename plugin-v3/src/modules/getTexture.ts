// src/modules/getTexture.ts

import PsdToPhaserPlugin from '../PsdToPhaserPlugin';

export default function getTextureModule(plugin: PsdToPhaserPlugin) {
  return function getTexture(scene: Phaser.Scene, psdKey: string, spritePath: string): Phaser.Textures.Texture | null {
    const psdData = plugin.getData(psdKey);
    if (!psdData) {
      console.log(`No PSD data found for key: ${psdKey}`);
      return null;
    }

    const spriteData = findSpriteByPath(psdData.sprites, spritePath);

    if (!spriteData) {
      console.log(`Sprite not found: ${spritePath}`);
      console.log(`Available sprites: ${JSON.stringify(psdData.sprites.map((s: any) => s.name))}`);
      return null;
    }

    const textureKey = `${psdKey}_${spriteData.name}`;
    const originalKey = spriteData.name;

    // Check if the texture is already loaded under either key
    if (scene.textures.exists(textureKey)) {
      return scene.textures.get(textureKey);
    }
    if (scene.textures.exists(originalKey)) {
      return scene.textures.get(originalKey);
    }

    // If not loaded, load it synchronously
    const filePath = `${psdData.basePath}/${spriteData.filePath}`;
    
    if (spriteData.type === 'atlas') {
      // Create atlas JSON
      const atlasJSON = {
        frames: {},
        meta: {
          image: spriteData.filePath,
          format: "RGBA8888",
          size: { w: spriteData.width, h: spriteData.height },
          scale: "1"
        }
      };

      // Populate frames
      for (const frameName in spriteData.frames) {
        const frame = spriteData.frames[frameName];
        atlasJSON.frames[frameName] = {
          frame: { x: frame.x, y: frame.y, w: frame.width, h: frame.height },
          rotated: false,
          trimmed: false,
          spriteSourceSize: { x: 0, y: 0, w: frame.width, h: frame.height },
          sourceSize: { w: frame.width, h: frame.height }
        };
      }

      scene.load.atlas(textureKey, filePath, atlasJSON);
    } else if (spriteData.type === 'spritesheet') {
      scene.load.spritesheet(textureKey, filePath, {
        frameWidth: spriteData.frame_width,
        frameHeight: spriteData.frame_height
      });
    } else {
      scene.load.image(textureKey, filePath);
    }

    scene.load.once(`filecomplete-${spriteData.type}-${textureKey}`, () => {
      console.log(`Texture loaded: ${textureKey}`);
    });

    scene.load.start();

    // Wait for the texture to load
    scene.load.once('complete', () => {
      console.log(`Load complete for: ${textureKey}`);
    });

    // Double-check if the texture is now available
    if (scene.textures.exists(textureKey)) {
      return scene.textures.get(textureKey);
    }

    console.log(`Failed to load texture: ${textureKey}`);
    return null;
  };
}


function findSpriteByPath(sprites: any[], path: string): any {
  const parts = path.split('/');
  
  function searchSprites(currentSprites: any[], currentParts: string[]): any {
    if (currentParts.length === 0) return null;
    
    const currentPart = currentParts[0];
    const remainingParts = currentParts.slice(1);
    
    for (const sprite of currentSprites) {
      if (sprite.name === currentPart) {
        if (remainingParts.length === 0) {
          return sprite;
        }
        
        if (sprite.children) {
          const found = searchSprites(sprite.children, remainingParts);
          if (found) return found;
        }
      }
      
      // Search in the current sprite's children even if the name doesn't match
      if (sprite.children) {
        const found = searchSprites(sprite.children, currentParts);
        if (found) return found;
      }
    }
    
    return null;
  }

  return searchSprites(sprites, parts);
}