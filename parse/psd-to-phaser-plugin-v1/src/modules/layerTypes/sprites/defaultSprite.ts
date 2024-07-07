// src/modules/types/sprites/defaultSprite.ts

import { SpriteData } from '../../typeDefinitions';

export function placeSprite(
  scene: Phaser.Scene, 
  sprite: SpriteData, 
  options: any = {}, 
  fullPath: string
): Phaser.GameObjects.Sprite {
  const gameObject = scene.add.sprite(sprite.x, sprite.y, fullPath);
  gameObject.setName(sprite.name);
  gameObject.setOrigin(0, 0);

  if (sprite.frame !== undefined) {
    gameObject.setFrame(sprite.frame);
  }

  return gameObject;
}