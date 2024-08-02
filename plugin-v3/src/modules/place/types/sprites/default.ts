import PsdToPhaserPlugin from '../../../../PsdToPhaserPlugin';

export function placeDefaultSprite(
  scene: Phaser.Scene,
  sprite: any,
  plugin: PsdToPhaserPlugin,
  psdKey: string
): Phaser.GameObjects.Sprite {
  const gameObject = scene.add.sprite(sprite.x, sprite.y, sprite.name);
  gameObject.setName(sprite.name);
  gameObject.setOrigin(0, 0);
  gameObject.setDepth(sprite.initialDepth || 0);

  if (sprite.frame !== undefined) {
    gameObject.setFrame(sprite.frame);
  }

  return gameObject;
}