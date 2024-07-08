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
): any {
  const wrappedSprite = plugin.storageManager.get(psdKey, spritePath);
  return wrappedSprite ? wrappedSprite.placed.texture : null;
}
