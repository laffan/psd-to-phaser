import PsdToPhaserPlugin from "../../../PsdToPhaserPlugin";

export function getSprite(
  plugin: PsdToPhaserPlugin,
  psdKey: string,
  spritePath: string
): Phaser.GameObjects.GameObject | null {
  return plugin.storageManager.get(psdKey, spritePath);
}

export function getAllSprites(
  plugin: PsdToPhaserPlugin,
  psdKey: string,
  options: { depth?: number } = {}
): Phaser.GameObjects.GameObject[] {
  return plugin.storageManager.getAll(psdKey, options);
}

export function getTexture(
  plugin: PsdToPhaserPlugin,
  psdKey: string,
  spritePath: string
): any {
  return plugin.storageManager.getTexture(psdKey, spritePath);
}