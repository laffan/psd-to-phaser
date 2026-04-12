/**
 * Animation sprite placement – creates a Sprite with an auto-playing animation.
 *
 * Animation properties can be set at three levels (in priority order):
 * 1. The `animationOptions` parameter passed to `place()`
 * 2. The PSD layer name attributes (e.g. `S | bounce | animation | frameRate: 5`)
 * 3. Built-in defaults (frameRate 24, infinite repeat)
 *
 * @module place/types/sprites/animation
 */

import PsdToPhaserPlugin from '../../../../PsdToPhaser';
import { setupSprite, getTextureKey } from '../../../shared/spriteSetup';

import type { AnimationSpriteLayer } from '../../../../types';

/**
 * Place an animation sprite and start its animation automatically.
 *
 * Creates the animation config from layer attributes, merges in any
 * caller overrides, registers the animation with Phaser's AnimationManager,
 * and starts playback.
 *
 * @param scene - The Phaser scene
 * @param layer - Animation sprite layer definition
 * @param _plugin - Plugin instance (unused)
 * @param _psdKey - PSD key (unused)
 * @param textureKey - Override texture key (for loadMultiple namespacing)
 * @param animationOptions - Optional overrides that take precedence over layer attributes
 * @returns The created Sprite game object (already playing its animation)
 *
 * @internal
 */
export function placeAnimation(
  scene: Phaser.Scene,
  layer: AnimationSpriteLayer,
  _plugin: PsdToPhaserPlugin,
  _psdKey: string,
  textureKey?: string,
  animationOptions?: Phaser.Types.Animations.Animation
): Phaser.GameObjects.Sprite {
  const actualTextureKey = getTextureKey(layer, textureKey);
  const gameObject = scene.add.sprite(layer.x, layer.y, actualTextureKey, 0);

  setupSprite(scene, layer, gameObject);

  if (layer.frame_width && layer.frame_height) {
    const animConfig: Phaser.Types.Animations.Animation = {
      key: actualTextureKey,
      frames: scene.anims.generateFrameNumbers(actualTextureKey, {
        start: 0,
        end: layer.frame_count ? layer.frame_count - 1 : -1,
      }),
      frameRate: layer.attributes?.frameRate || 24,
      repeat: layer.attributes?.repeat !== undefined ? layer.attributes.repeat : -1,
    };

    // Add all other animation properties from attributes if they exist
    if (layer.attributes?.yoyo !== undefined) {
      animConfig.yoyo = layer.attributes.yoyo;
    }
    if (layer.attributes?.delay !== undefined) {
      animConfig.delay = layer.attributes.delay;
    }
    if (layer.attributes?.repeatDelay !== undefined) {
      animConfig.repeatDelay = layer.attributes.repeatDelay;
    }
    if (layer.attributes?.duration !== undefined) {
      animConfig.duration = layer.attributes.duration;
    }
    if (layer.attributes?.showOnStart !== undefined) {
      animConfig.showOnStart = layer.attributes.showOnStart;
    }
    if (layer.attributes?.hideOnComplete !== undefined) {
      animConfig.hideOnComplete = layer.attributes.hideOnComplete;
    }

    // Merge in animationOptions (these take precedence over layer attributes)
    if (animationOptions) {
      Object.assign(animConfig, animationOptions);
      // Ensure key is preserved since it's required for the animation system
      animConfig.key = actualTextureKey;
      // Ensure frames are preserved if not overridden
      if (!animationOptions.frames) {
        animConfig.frames = scene.anims.generateFrameNumbers(actualTextureKey, {
          start: 0,
          end: layer.frame_count ? layer.frame_count - 1 : -1,
        });
      }
    }

    if (!scene.anims.exists(actualTextureKey)) {
      scene.anims.create(animConfig);
    }

    gameObject.play(actualTextureKey);
  }

  return gameObject;
}