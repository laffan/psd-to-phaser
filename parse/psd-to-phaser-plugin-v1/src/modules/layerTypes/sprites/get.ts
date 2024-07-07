import PsdToPhaserPlugin from "../../../PsdToPhaserPlugin";
import { WrappedObject } from '../../typeDefinitions';

export function getSprite(
  plugin: PsdToPhaserPlugin,
  psdKey: string,
  spritePath: string
): WrappedObject | null {
  return plugin.storageManager.get(psdKey, spritePath);
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
