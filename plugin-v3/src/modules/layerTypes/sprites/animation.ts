// src/modules/types/sprites/animation.ts

import { SpriteData } from "../../typeDefinitions";

export function placeAnimation(
  scene: Phaser.Scene,
  sprite: SpriteData,
  options: any = {},
  fullPath: string
): Phaser.GameObjects.Sprite {
  const gameObject = scene.add.sprite(sprite.x, sprite.y, fullPath, 0);
  gameObject.setName(sprite.name);
  gameObject.setOrigin(0, 0);
  gameObject.setDepth(sprite.initialDepth);

  if (sprite.frame_width && sprite.frame_height) {
    const defaultAnimConfig: Phaser.Types.Animations.Animation = {
      key: sprite.name,
      frames: scene.anims.generateFrameNumbers(fullPath, {
        start: 0,
        end: sprite.frame_count ? sprite.frame_count - 1 : -1,
      }),
      frameRate: 24,
      repeat: -1,
    };

    const animConfig = applyAnimationOverrides(defaultAnimConfig, sprite);

    // Create the animation if it doesn't exist
    if (!scene.anims.exists(sprite.name)) {
      scene.anims.create(animConfig);
    }

    // Play the animation immediately
    gameObject.play(sprite.name);
  } else {
    console.warn(`Animation ${sprite.name} is missing frame dimensions.`);
  }

  return gameObject;
}

function applyAnimationOverrides(
  defaultConfig: Phaser.Types.Animations.Animation,
  sprite: SpriteData
): Phaser.Types.Animations.Animation {
  const validKeys = Object.keys(defaultConfig);
  const overriddenConfig = { ...defaultConfig };

  for (const key in sprite) {
    if (validKeys.includes(key)) {
      (overriddenConfig as any)[key] = sprite[key];
    }
  }

  return overriddenConfig;
}

export function updateAnimation(
  scene: Phaser.Scene,
  spriteName: string,
  animationOptions: Partial<Phaser.Types.Animations.Animation>
): void {
  const sprite = scene.children.getByName(
    spriteName
  ) as Phaser.GameObjects.Sprite;
  if (!sprite) {
    console.error(`Sprite ${spriteName} not found`);
    return;
  }

  const currentAnim = sprite.anims.currentAnim;
  if (!currentAnim) {
    console.error(`No animation found for sprite ${spriteName}`);
    return;
  }

  const updatedConfig = { ...currentAnim.config, ...animationOptions };
  scene.anims.remove(currentAnim.key);
  scene.anims.create(updatedConfig);

  sprite.play(updatedConfig.key);
}
