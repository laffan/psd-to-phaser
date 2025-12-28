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
 * Note: Mask images are converted from luminance to alpha, so grayscale masks
 * (white=visible, black=hidden) work correctly with Phaser's BitmapMask.
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
    // Convert luminance to alpha for the mask to work with Phaser's BitmapMask
    const converted = convertLuminanceToAlpha(scene, maskKey, alphaKeyMaskKey);
    if (!converted) {
      // Fallback to original texture if conversion fails
      finalMaskKey = maskKey;
      console.warn(`Failed to convert mask luminance to alpha, using original texture`);
    }
  }

  // Create ONE mask image at the layer position
  // Masks are positioned in global space, not relative to game objects
  const maskImage = scene.add.image(layer.x, layer.y, finalMaskKey);
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

/**
 * Convert a grayscale/luminance mask image to use alpha channel.
 * Phaser's BitmapMask uses alpha, but many mask images are grayscale
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
    // For each pixel: alpha = luminance (average of RGB)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Calculate luminance (simple average, could use weighted formula)
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
