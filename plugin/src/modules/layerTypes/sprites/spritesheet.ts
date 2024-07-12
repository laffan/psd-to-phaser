import { SpriteData } from '../../typeDefinitions';

export function placeSpritesheet(
  scene: Phaser.Scene,
  sprite: SpriteData,
  options: any = {},
  fullPath: string
): Phaser.GameObjects.Group {
  const group = scene.add.group();
  group.name = sprite.name;

  if (sprite.placement && Array.isArray(sprite.placement)) {
    sprite.placement.forEach((piece) => {
      const { frame, x, y, layerOrder, instanceName } = piece;
      const spriteObject = scene.add.sprite(x, y, fullPath, frame);
      spriteObject.setName(instanceName);
      spriteObject.setOrigin(0, 0);
      group.add(spriteObject);
      spriteObject.setDepth(layerOrder);
    });
  }

  group.setDepth(sprite.layerOrder || 0);

  return group;
}