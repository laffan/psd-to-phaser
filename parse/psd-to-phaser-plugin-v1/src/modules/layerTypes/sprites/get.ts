import PsdToPhaserPlugin from "../../../PsdToPhaserPlugin";
import { WrappedObject } from '../../typeDefinitions';
import { createRemoveFunction } from '../../core/RemoveFunction';

export function getSprite(
  plugin: PsdToPhaserPlugin,
  psdKey: string,
  spritePath: string
): WrappedObject | null {
  const wrappedObject = plugin.storageManager.get(psdKey, spritePath);
  if (wrappedObject) {
    wrappedObject.remove = createRemoveFunction(plugin.storageManager, psdKey, spritePath);
  }
  return wrappedObject;
}


export function getAllSprites(
  plugin: PsdToPhaserPlugin,
  psdKey: string,
  options: { depth?: number } = {}
): WrappedObject[] {
  return plugin.storageManager.getAll(psdKey, options);
}

export function getTexture(
  plugin: PsdToPhaserPlugin,
  psdKey: string,
  spritePath: string
): Phaser.Textures.Texture | null {
  const wrappedSprite = plugin.storageManager.get(psdKey, spritePath);
  if (wrappedSprite && wrappedSprite.placed) {
    const texture = wrappedSprite.placed.texture;
    if (texture) {
      return texture;
    }
  }
  
  // If the texture isn't found, try to load it
  const psdData = plugin.getData(psdKey);
  if (psdData && psdData.basePath) {
    const sprite = findSpriteByPath(psdData.sprites, spritePath);
    if (sprite) {
      const key = `${psdKey}_${sprite.name}`;
      const url = `${psdData.basePath}/${sprite.filePath}`;
      plugin.game.textures.addImage(key, url);
      return plugin.game.textures.get(key);
    }
  }
  
  console.warn(`Texture not found for sprite: ${spritePath}`);
  return null;
}

// Helper function to find sprite data by path
function findSpriteByPath(sprites: any[], path: string): any {
  const parts = path.split('/');
  let current = sprites;
  for (const part of parts) {
    const found = current.find((s: any) => s.name === part);
    if (!found) return null;
    if (found.children) {
      current = found.children;
    } else {
      return found;
    }
  }
  return null;
}