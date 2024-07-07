export function storePlacedSprite(plugin: any, psdKey: string, spritePath: string, spriteObject: Phaser.GameObjects.GameObject): void {
  const psdData = plugin.getData(psdKey);
  if (!psdData.placedSprites) {
    psdData.placedSprites = {};
  }
  psdData.placedSprites[spritePath] = spriteObject;
}