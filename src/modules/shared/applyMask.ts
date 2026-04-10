// src/modules/shared/applyMask.ts
// Phaser 4: BitmapMask replaced by Filter system
// v3: maskImage.createBitmapMask() + gameObject.setMask(mask)
// v4: gameObject.filters.internal.addMask(maskImage)

import type { PsdLayer } from '../../types';
import { hasMask } from '../../types';

/**
 * Apply a mask filter to a game object if the layer has a mask defined.
 * The mask texture should already be loaded with key `${layerName}_mask`.
 *
 * Phaser 4 uses the Filter system instead of BitmapMask.
 *
 * @param scene - The Phaser scene
 * @param layer - The layer data that may contain mask information
 * @param gameObject - The game object to apply the mask to
 * @returns The created mask image (hidden), or null if no mask was applied
 */
export function applyMaskToGameObject(
  scene: Phaser.Scene,
  layer: PsdLayer,
  gameObject: Phaser.GameObjects.GameObject
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
  const maskImage = scene.add.image(layer.x, layer.y, maskKey);
  maskImage.setOrigin(0, 0);
  maskImage.setVisible(false);

  // Phaser 4: Apply mask via the Filter system
  if ('filters' in gameObject && (gameObject as any).filters?.internal) {
    (gameObject as any).filters.internal.addMask(maskImage);
  }

  return maskImage;
}

/**
 * Apply a mask filter to a container and all its children.
 * Useful for group layers with masks.
 *
 * Phaser 4 uses the Filter system instead of BitmapMask.
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

  // Phaser 4: Apply mask via the Filter system on the container
  if ('filters' in container && (container as any).filters?.internal) {
    (container as any).filters.internal.addMask(maskImage);
  }

  return maskImage;
}

/**
 * Apply a SHARED mask filter to all children in a Phaser Group.
 * Creates ONE mask image and applies it to all children via the Filter system.
 *
 * Note: In Phaser 4, masks are applied via filters.internal.addMask()
 * Mask images are converted from luminance to alpha for proper masking.
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
  const alphaKeyMaskKey = `${layer.name}_mask_alpha`;

  if (!scene.textures.exists(maskKey)) {
    console.warn(`Mask texture not found: ${maskKey}`);
    return null;
  }

  // Check if we already created the alpha-converted texture
  let finalMaskKey = alphaKeyMaskKey;
  if (!scene.textures.exists(alphaKeyMaskKey)) {
    // Convert luminance to alpha for the mask to work properly
    const converted = convertLuminanceToAlpha(scene, maskKey, alphaKeyMaskKey);
    if (!converted) {
      // Fallback to original texture if conversion fails
      finalMaskKey = maskKey;
      console.warn(`Failed to convert mask luminance to alpha, using original texture`);
    }
  }

  // Use mask-specific position if available, otherwise fall back to layer position
  const maskX = layer.maskX ?? layer.x;
  const maskY = layer.maskY ?? layer.y;

  // Create ONE mask image at the mask position
  const maskImage = scene.add.image(maskX, maskY, finalMaskKey);
  maskImage.setOrigin(0, 0);
  maskImage.setVisible(false);

  // Phaser 4: Apply the mask filter to ALL children in the group
  const children = group.getChildren();
  console.log(`🎭 Applying mask "${maskKey}" to ${children.length} children at position (${maskX}, ${maskY})`);

  children.forEach((child, index) => {
    if ('filters' in child && (child as any).filters?.internal) {
      (child as any).filters.internal.addMask(maskImage);
      console.log(`  - Applied mask to child ${index}: ${child.name || 'unnamed'}`);
    }
  });

  return maskImage;
}

/**
 * Convert a grayscale/luminance mask image to use alpha channel.
 * Phaser 4's mask filter uses alpha, but many mask images are grayscale
 * (white=visible, black=hidden). This converts luminance to alpha.
 *
 * @param scene - The Phaser scene
 * @param sourceKey - The source texture key
 * @param destKey - The destination texture key for the converted mask
 * @returns true if conversion succeeded, false otherwise
 */
function convertLuminanceToAlpha(
  scene: Phaser.Scene,
  sourceKey: string,
  destKey: string
): boolean {
  try {
    const sourceTexture = scene.textures.get(sourceKey);
    const sourceImage = sourceTexture.getSourceImage() as HTMLImageElement;

    if (!sourceImage || !sourceImage.width || !sourceImage.height) {
      return false;
    }

    // Create a canvas to manipulate pixel data
    const canvas = document.createElement('canvas');
    canvas.width = sourceImage.width;
    canvas.height = sourceImage.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return false;
    }

    // Draw the source image
    ctx.drawImage(sourceImage, 0, 0);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert luminance to alpha
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const luminance = (r + g + b) / 3;
      // Set alpha to luminance, keep RGB as white for clean masking
      data[i] = 255;     // R
      data[i + 1] = 255; // G
      data[i + 2] = 255; // B
      data[i + 3] = luminance; // A = luminance
    }

    // Put the modified data back
    ctx.putImageData(imageData, 0, 0);

    // Create a new texture from the canvas
    scene.textures.addCanvas(destKey, canvas);

    console.log(`🎭 Converted mask "${sourceKey}" luminance to alpha → "${destKey}"`);
    return true;
  } catch (error) {
    console.error(`Failed to convert mask luminance to alpha:`, error);
    return false;
  }
}
