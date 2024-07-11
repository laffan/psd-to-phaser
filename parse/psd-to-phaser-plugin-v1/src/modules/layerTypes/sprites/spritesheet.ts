import { SpriteData } from '../../typeDefinitions';

export function placeSpritesheet(
  scene: Phaser.Scene, 
  sprite: SpriteData, 
  options: any = {}, 
  fullPath: string
): Phaser.GameObjects.Container {
  const container = scene.add.container(sprite.x, sprite.y);
  container.setName(sprite.name);
  container.setDepth(sprite.layerOrder || 0); // Set depth based on layerOrder

  if (sprite.placement && Array.isArray(sprite.placement)) {
    sprite.placement.forEach((piece) => {
      const { frame, x, y, layerOrder, instanceName } = piece;
      const spriteObject = scene.add.sprite(x, y, fullPath, frame);
      spriteObject.setName(instanceName);
      spriteObject.setOrigin(0, 0);
      container.add(spriteObject);
      spriteObject.setDepth(layerOrder);
      
    });
  }

  return container;
}