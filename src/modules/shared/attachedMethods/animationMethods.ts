/**
 * Animation method attachment – adds `updateAnimation()` to placed sprites
 * and groups so animation properties can be changed at runtime.
 *
 * @module shared/attachedMethods/animationMethods
 *
 * @example
 * ```js
 * const bounce = this.P2P.place(this, "psd_key", "nested/bounce");
 * bounce.updateAnimation({ frameRate: 5, yoyo: true });
 * ```
 */

import PsdToPhaserPlugin from '../../../PsdToPhaser';

/**
 * Attach `updateAnimation()` to a placed game object or group.
 *
 * - On a Sprite: updates the currently playing animation with new options
 * - On a Group: recursively finds all animated sprites and updates them
 *
 * @param plugin - Plugin instance
 * @param gameObject - The placed object to enhance
 *
 * @internal
 */
export function attachAnimationMethods(plugin: PsdToPhaserPlugin, gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group): void {
  if (gameObject instanceof Phaser.GameObjects.Group) {
    attachGroupAnimationMethods(plugin, gameObject);
  } else if (gameObject instanceof Phaser.GameObjects.Sprite) {
    attachSpriteAnimationMethods(plugin, gameObject);
  }
}

/**
 * Attach `updateAnimation()` to an individual animated sprite.
 * @internal
 */
function attachSpriteAnimationMethods(_plugin: PsdToPhaserPlugin, sprite: Phaser.GameObjects.Sprite): void {
  (sprite as any).updateAnimation = function(animationOptions: Partial<Phaser.Types.Animations.Animation>) {
    return updateSpriteAnimation(sprite, animationOptions);
  };
}

/**
 * Attach `updateAnimation()` to a group – recursively updates all
 * animated sprites within the group.
 * @internal
 */
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

/**
 * Update the currently playing animation on a sprite.
 *
 * Merges the new options with the existing animation config, removes
 * the old animation, creates a new one, and restarts playback.
 *
 * @param sprite - The animated sprite
 * @param animationOptions - Properties to merge (frameRate, yoyo, repeat, etc.)
 * @returns The sprite (for chaining)
 *
 * @internal
 */
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