// src/modules/shared/spriteSetup.ts

import { attachAttributes } from './attachAttributes';
import { applyMaskToGameObject } from './applyMask';

import type { SpriteLayer } from '../../types';

/**
 * Common setup for a single sprite game object.
 * Applies standard configuration: name, origin, depth, attributes, and mask.
 *
 * @param scene - The Phaser scene
 * @param layer - The sprite layer data
 * @param gameObject - The sprite to configure
 */
export function setupSprite(
  scene: Phaser.Scene,
  layer: SpriteLayer,
  gameObject: Phaser.GameObjects.Sprite
): void {
  gameObject.setName(layer.name);
  gameObject.setOrigin(0, 0);
  gameObject.setDepth(layer.initialDepth ?? 0);
  attachAttributes(layer, gameObject);
  applyMaskToGameObject(scene, layer, gameObject);
}

/**
 * Common setup for a sprite group.
 * Applies standard configuration: name, depth, attributes.
 *
 * @param layer - The sprite layer data
 * @param group - The group to configure
 */
export function setupSpriteGroup(
  layer: SpriteLayer,
  group: Phaser.GameObjects.Group
): void {
  group.name = layer.name;
  group.setDepth(layer.initialDepth ?? 0);
  attachAttributes(layer, group);
}

/**
 * Apply mask to all children in a group if the layer has a mask.
 *
 * @param scene - The Phaser scene
 * @param layer - The sprite layer data
 * @param group - The group whose children should receive the mask
 */
export function applyMaskToGroupChildren(
  scene: Phaser.Scene,
  layer: SpriteLayer,
  group: Phaser.GameObjects.Group
): void {
  if (layer.mask && layer.maskPath) {
    group.getChildren().forEach((child) => {
      applyMaskToGameObject(scene, layer, child as Phaser.GameObjects.Sprite);
    });
  }
}

/**
 * Get the actual texture key to use, preferring the provided key over the layer name.
 *
 * @param layer - The sprite layer data
 * @param textureKey - Optional override texture key
 * @returns The texture key to use
 */
export function getTextureKey(layer: SpriteLayer, textureKey?: string): string {
  return textureKey || layer.name;
}

/**
 * Setup for individual sprite instances within a group (atlas/spritesheet).
 * Applies: name, origin, depth.
 *
 * @param sprite - The sprite to configure
 * @param name - The instance name
 * @param depth - The depth value
 */
export function setupSpriteInstance(
  sprite: Phaser.GameObjects.Sprite,
  name: string,
  depth: number
): void {
  sprite.setName(name);
  sprite.setOrigin(0, 0);
  sprite.setDepth(depth);
}
