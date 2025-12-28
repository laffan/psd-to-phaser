// src/modules/shared/applyMask.ts

import type { PsdLayer } from '../../types';
import { hasMask } from '../../types';

/**
 * Apply a bitmap mask to a game object if the layer has a mask defined.
 * The mask texture should already be loaded with key `${layerName}_mask`.
 *
 * @param scene - The Phaser scene
 * @param layer - The layer data that may contain mask information
 * @param gameObject - The game object to apply the mask to
 * @returns The created mask image (hidden), or null if no mask was applied
 */
export function applyMaskToGameObject(
  scene: Phaser.Scene,
  layer: PsdLayer,
  gameObject: Phaser.GameObjects.GameObject & { setMask?: (mask: Phaser.Display.Masks.BitmapMask) => void }
): Phaser.GameObjects.Image | null {
  if (!hasMask(layer)) {
    return null;
  }

  const maskKey = `${layer.name}_mask`;

  if (!scene.textures.exists(maskKey)) {
    console.warn(`Mask texture not found: ${maskKey}`);
    return null;
  }

  // Create the mask image at the layer position
  // The mask image needs to be positioned to align with the masked object
  const maskImage = scene.add.image(layer.x, layer.y, maskKey);
  maskImage.setOrigin(0, 0);
  maskImage.setVisible(false); // The mask image should be invisible

  // Create the bitmap mask from the image
  const bitmapMask = maskImage.createBitmapMask();

  // Apply the mask to the game object
  if (gameObject.setMask) {
    gameObject.setMask(bitmapMask);
  }

  return maskImage;
}

/**
 * Apply a bitmap mask to a container and all its children.
 * Useful for group layers with masks.
 *
 * @param scene - The Phaser scene
 * @param layer - The layer data that may contain mask information
 * @param container - The container to apply the mask to
 * @returns The created mask image (hidden), or null if no mask was applied
 */
export function applyMaskToContainer(
  scene: Phaser.Scene,
  layer: PsdLayer,
  container: Phaser.GameObjects.Container
): Phaser.GameObjects.Image | null {
  if (!hasMask(layer)) {
    return null;
  }

  const maskKey = `${layer.name}_mask`;

  if (!scene.textures.exists(maskKey)) {
    console.warn(`Mask texture not found: ${maskKey}`);
    return null;
  }

  // Create the mask image at the container position
  const maskImage = scene.add.image(layer.x, layer.y, maskKey);
  maskImage.setOrigin(0, 0);
  maskImage.setVisible(false);

  // Create the bitmap mask from the image
  const bitmapMask = maskImage.createBitmapMask();

  // Apply the mask to the container (which affects all children)
  container.setMask(bitmapMask);

  return maskImage;
}

/**
 * Apply a SHARED bitmap mask to all children in a Phaser Group.
 * Creates ONE mask image and ONE bitmap mask, then applies it to all children.
 * This is more efficient and correct - masks in Phaser are positioned in global space
 * and can be shared across multiple game objects.
 *
 * @param scene - The Phaser scene
 * @param layer - The layer data that contains mask information
 * @param group - The Phaser group whose children should receive the mask
 * @returns The created mask image (hidden), or null if no mask was applied
 */
export function applySharedMaskToGroup(
  scene: Phaser.Scene,
  layer: PsdLayer,
  group: Phaser.GameObjects.Group
): Phaser.GameObjects.Image | null {
  if (!hasMask(layer)) {
    return null;
  }

  const maskKey = `${layer.name}_mask`;

  if (!scene.textures.exists(maskKey)) {
    console.warn(`Mask texture not found: ${maskKey}`);
    return null;
  }

  // Create ONE mask image at the layer position
  // Masks are positioned in global space, not relative to game objects
  const maskImage = scene.add.image(layer.x, layer.y, maskKey);
  maskImage.setOrigin(0, 0);
  maskImage.setVisible(false);

  // Create ONE bitmap mask from the image
  const bitmapMask = maskImage.createBitmapMask();

  // Apply the SAME bitmap mask to ALL children in the group
  const children = group.getChildren();
  console.log(`🎭 Applying mask "${maskKey}" to ${children.length} children at position (${layer.x}, ${layer.y})`);

  children.forEach((child, index) => {
    if ('setMask' in child && typeof child.setMask === 'function') {
      (child as Phaser.GameObjects.Sprite).setMask(bitmapMask);
      console.log(`  - Applied mask to child ${index}: ${child.name || 'unnamed'}`);
    }
  });

  return maskImage;
}
