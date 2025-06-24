// src/modules/shared/attachedMethods/animationMethods.ts

import PsdToPhaserPlugin from '../../../PsdToPhaser';

export function attachAnimationMethods(plugin: PsdToPhaserPlugin, gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group): void {
  if (gameObject instanceof Phaser.GameObjects.Group) {
    attachGroupAnimationMethods(plugin, gameObject);
  } else if (gameObject instanceof Phaser.GameObjects.Sprite) {
    attachSpriteAnimationMethods(plugin, gameObject);
  }
}

function attachSpriteAnimationMethods(_plugin: PsdToPhaserPlugin, sprite: Phaser.GameObjects.Sprite): void {
  (sprite as any).updateAnimation = function(animationOptions: Partial<Phaser.Types.Animations.Animation>) {
    return updateSpriteAnimation(sprite, animationOptions);
  };
}

function attachGroupAnimationMethods(_plugin: PsdToPhaserPlugin, group: Phaser.GameObjects.Group): void {
  (group as any).updateAnimation = function(animationOptions: Partial<Phaser.Types.Animations.Animation>) {
    function findAndUpdateAnimatedSprites(gameObject: any): void {
      if (gameObject instanceof Phaser.GameObjects.Sprite && gameObject.anims && gameObject.anims.currentAnim) {
        updateSpriteAnimation(gameObject, animationOptions);
      } else if (gameObject instanceof Phaser.GameObjects.Group) {
        // Recursively search in groups
        const children = gameObject.getChildren();
        children.forEach(findAndUpdateAnimatedSprites);
      }
    }

    findAndUpdateAnimatedSprites(group);
    return group;
  };
}

function updateSpriteAnimation(sprite: Phaser.GameObjects.Sprite, animationOptions: Partial<Phaser.Types.Animations.Animation>) {
  const currentAnimKey = sprite.anims.currentAnim?.key;
  if (!currentAnimKey) {
    console.warn('No animation currently playing on sprite');
    return sprite;
  }

  // Get the current animation config
  const scene = sprite.scene;
  const currentAnim = scene.anims.get(currentAnimKey);
  if (!currentAnim) {
    console.warn(`Animation ${currentAnimKey} not found`);
    return sprite;
  }

  // Create updated config by merging current config with new options
  const updatedConfig: Phaser.Types.Animations.Animation = {
    key: currentAnimKey,
    frames: currentAnim.frames.map(frame => ({ key: frame.textureKey, frame: frame.textureFrame })),
    frameRate: currentAnim.frameRate,
    duration: currentAnim.duration,
    repeat: currentAnim.repeat,
    repeatDelay: currentAnim.repeatDelay,
    yoyo: currentAnim.yoyo,
    showOnStart: currentAnim.showOnStart,
    hideOnComplete: currentAnim.hideOnComplete,
    ...animationOptions
  };
  // Ensure key is preserved
  updatedConfig.key = currentAnimKey;

  // Remove the old animation and create the new one
  scene.anims.remove(currentAnimKey);
  scene.anims.create(updatedConfig);

  // Restart the animation with the new config
  sprite.play(currentAnimKey);

  return sprite;
}