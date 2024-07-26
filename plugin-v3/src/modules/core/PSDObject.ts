export class PSDObject {
  constructor(data: any, parent: PSDObject | null = null) {
    Object.assign(this, data);
  }

private placedSprites: Record<string, Record<string, Phaser.GameObjects.GameObject>> = {};

  getPlacedSprite(
    psdKey: string,
    spritePath: string
  ): Phaser.GameObjects.GameObject | null {
    return this.placedSprites[psdKey]?.[spritePath] || null;
  }

  setPlacedSprite(
    psdKey: string,
    spritePath: string,
    sprite: Phaser.GameObjects.GameObject
  ): void {
    if (!this.placedSprites[psdKey]) {
      this.placedSprites[psdKey] = {};
    }
    this.placedSprites[psdKey][spritePath] = sprite;
  }

  getAllPlacedSprites(psdKey: string): Phaser.GameObjects.GameObject[] {
    return Object.values(this.placedSprites[psdKey] || {});
  }
}

export function createPSDObject(data: any): PSDObject {
  return new PSDObject(data);
}
