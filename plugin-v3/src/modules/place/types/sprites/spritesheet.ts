import PsdToPhaserPlugin from '../../../../PsdToPhaserPlugin';

export function placeSpritesheet(
  scene: Phaser.Scene,
  sprite: any,
  plugin: PsdToPhaserPlugin,
  psdKey: string
): Phaser.GameObjects.Group {
  const group = scene.add.group();
  group.name = sprite.name;

  if (sprite.placement && Array.isArray(sprite.placement)) {
    sprite.placement.forEach((piece: any) => {
      const { frame, x, y, initialDepth, instanceName } = piece;
      const spriteObject = scene.add.sprite(x, y, sprite.name, frame);
      spriteObject.setName(instanceName);
      spriteObject.setOrigin(0, 0);
      group.add(spriteObject);
      spriteObject.setDepth(initialDepth || 0);
    });
  }

  group.setDepth(sprite.initialDepth || 0);

  return group;
}