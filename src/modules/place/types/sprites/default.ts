/**
 * Default (single-image) sprite placement.
 *
 * @module place/types/sprites/default
 */

import PsdToPhaserPlugin from '../../../../PsdToPhaser';
import { setupSprite, getTextureKey } from '../../../shared/spriteSetup';

import type { DefaultSpriteLayer } from '../../../../types';

/**
 * Place a simple single-frame sprite at its PSD position.
 *
 * Applies standard setup (name, origin, depth, attributes, mask) via
 * {@link setupSprite} and optionally sets a specific frame index.
 *
 * @param scene - The Phaser scene
 * @param layer - Default sprite layer definition
 * @param _plugin - Plugin instance (unused, reserved for consistency)
 * @param _psdKey - PSD key (unused)
 * @param textureKey - Override texture key (for loadMultiple namespacing)
 * @returns The created Sprite game object
 *
 * @internal
 */
export function placeDefaultSprite(
  scene: Phaser.Scene,
  layer: DefaultSpriteLayer,
  _plugin: PsdToPhaserPlugin,
  _psdKey: string,
  textureKey?: string
): Phaser.GameObjects.Sprite {
  const actualTextureKey = getTextureKey(layer, textureKey);
  const gameObject = scene.add.sprite(layer.x, layer.y, actualTextureKey);

  setupSprite(scene, layer, gameObject);

  if (layer.frame !== undefined) {
    gameObject.setFrame(layer.frame);
  }

  return gameObject;
}
