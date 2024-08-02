
import PsdToPhaserPlugin from '../../../../PsdToPhaserPlugin';

export function placeAtlas(
  scene: Phaser.Scene,
  sprite: any,
  plugin: PsdToPhaserPlugin,
  psdKey: string
): Phaser.GameObjects.Group {
  const group = scene.add.group();
  group.name = sprite.name;

  if (sprite.instances && Array.isArray(sprite.instances)) {
    sprite.instances.forEach((instance: any) => {
      const { name, x, y } = instance;
      const spriteObject = scene.add.sprite(x, y, sprite.name, name);
      spriteObject.setName(name);
      spriteObject.setOrigin(0, 0);
      group.add(spriteObject);
      spriteObject.setDepth(sprite.initialDepth || 0);
    });
  }

  group.setDepth(sprite.initialDepth || 0);

  return group;
}