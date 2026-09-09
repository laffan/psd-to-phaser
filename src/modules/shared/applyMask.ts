// src/modules/shared/applyMask.ts

import type { PsdLayer } from '../../types';
import { hasMask } from '../../types';

/**
 * Attach a Mask filter to a game object, using `maskImage` as the mask source.
 *
 * Phaser 4 removed BitmapMask: masks are now Filters, added to a game object's
 * internal filter list.
 *
 * An internal filter renders the object into its own framebuffer, so the mask has to
 * be viewed through the same camera to line up. That camera is the object's own
 * `filterCamera`, which Phaser keeps focused on the object; passing it as the mask's
 * `viewCamera` gives the world-space positioning BitmapMask had in Phaser 3. Leaving
 * it unset (or passing the scene camera) pins the mask to each object's own bounds
 * instead, which shifts the mask per object.
 *
 * Filters are WebGL only. Under the Canvas renderer `enableFilters()` returns early
 * and `filters` stays null, so this returns null and the object renders unmasked.
 *
 * @param gameObject - The game object to mask
 * @param maskImage - The (hidden) image used as the mask source
 * @returns The Mask filter controller, or null if filters are unavailable
 */
export function addMaskFilter(
  gameObject: Phaser.GameObjects.GameObject,
  maskImage: Phaser.GameObjects.Image
): Phaser.Filters.Mask | null {
  gameObject.enableFilters();

  if (!gameObject.filters) {
    console.warn(
      'Masks require the WebGL renderer in Phaser 4. Skipping mask for',
      gameObject.name || gameObject.type
    );
    return null;
  }

  return gameObject.filters.internal.addMask(maskImage, false, gameObject.filterCamera);
}

/**
 * Apply a mask to a game object if the layer has a mask defined.
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
  // The mask image needs to be positioned to align with the masked object
  const maskImage = scene.add.image(layer.x, layer.y, maskKey);
  maskImage.setOrigin(0, 0);
  maskImage.setVisible(false); // The mask image should be invisible

  // Apply the mask to the game object
  addMaskFilter(gameObject, maskImage);

  return maskImage;
}

/**
 * Apply a mask to a container and all its children.
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

  // Apply the mask to the container (which affects all children)
  addMaskFilter(container, maskImage);

  return maskImage;
}

/**
 * Apply a SHARED mask to all children in a Phaser Group.
 * Creates ONE mask image, then adds a Mask filter for it to every child.
 *
 * Note: Mask images are converted from luminance to alpha, so grayscale masks
 * (white=visible, black=hidden) work correctly with Phaser's Mask filter, which
 * multiplies the input by the alpha of the mask.
 *
 * Each filtered child renders through its own framebuffer, so masking a large
 * group is not free - mask the smallest set of objects you can get away with.
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
    // Convert luminance to alpha so the Mask filter reads the mask correctly
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
  // Masks are positioned in global space, not relative to game objects
  const maskImage = scene.add.image(maskX, maskY, finalMaskKey);
  maskImage.setOrigin(0, 0);
  maskImage.setVisible(false);

  // Apply the SAME mask image to ALL children in the group
  const children = group.getChildren();
  console.log(`🎭 Applying mask "${maskKey}" to ${children.length} children at position (${maskX}, ${maskY})`);

  children.forEach((child, index) => {
    addMaskFilter(child, maskImage);
    console.log(`  - Applied mask to child ${index}: ${child.name || 'unnamed'}`);
  });

  return maskImage;
}

/**
 * Convert a grayscale/luminance mask image to use alpha channel.
 * The Mask filter multiplies by alpha, but many mask images are grayscale
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
