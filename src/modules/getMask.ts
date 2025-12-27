// src/modules/getMask.ts

import PsdToPhaserPlugin from '../PsdToPhaser';
import { findLayer } from './shared/findLayer';
import { hasMask } from '../types';

/**
 * Result object from getMask containing the mask image and bitmap mask
 */
export interface MaskResult {
  /** The hidden image used to create the mask */
  maskImage: Phaser.GameObjects.Image;
  /** The bitmap mask that can be applied to game objects */
  bitmapMask: Phaser.Display.Masks.BitmapMask;
}

export default function getMaskModule(plugin: PsdToPhaserPlugin) {
  /**
   * Get a bitmap mask for a layer. The mask texture should already be loaded.
   *
   * @param scene - The Phaser scene
   * @param psdKey - The key used when loading the PSD
   * @param layerPath - Path to the layer (e.g., "GroupName/LayerName")
   * @returns MaskResult with the mask image and bitmap mask, or null if no mask exists
   *
   * @example
   * // Get a mask for a layer
   * const mask = psd.getMask(this, 'myPsd', 'Background/Trees');
   * if (mask) {
   *   mySprite.setMask(mask.bitmapMask);
   * }
   */
  return function getMask(
    scene: Phaser.Scene,
    psdKey: string,
    layerPath: string
  ): MaskResult | null {
    const psdData = plugin.getData(psdKey);
    if (!psdData) {
      console.log(`No PSD data found for key: ${psdKey}`);
      return null;
    }

    const pathParts = layerPath.split('/');
    const layerData = findLayer(psdData.original.layers, pathParts);

    if (!layerData) {
      console.log(`Layer not found: ${layerPath}`);
      return null;
    }

    // Check if the layer has a mask
    if (!hasMask(layerData)) {
      console.log(`Layer "${layerPath}" does not have a mask`);
      return null;
    }

    const maskKey = `${layerData.name}_mask`;

    // Check if the mask texture is already loaded
    if (!scene.textures.exists(maskKey)) {
      // Try to load it on-demand
      const maskPath = `${psdData.basePath}/${layerData.maskPath}`;

      scene.load.image(maskKey, maskPath);
      scene.load.once(`filecomplete-image-${maskKey}`, () => {
        if (plugin.isDebugEnabled('console')) {
          console.log(`🎭 Loaded mask on-demand: ${maskKey}`);
        }
      });

      scene.load.start();

      // Since loading is asynchronous, return null for now
      // The user should call getMask again after the load completes
      console.log(`Mask texture "${maskKey}" is being loaded. Call getMask again after load completes.`);
      return null;
    }

    // Create the mask image at the layer position
    const maskImage = scene.add.image(layerData.x, layerData.y, maskKey);
    maskImage.setOrigin(0, 0);
    maskImage.setVisible(false); // The mask image should be invisible

    // Create the bitmap mask from the image
    const bitmapMask = maskImage.createBitmapMask();

    return {
      maskImage,
      bitmapMask,
    };
  };
}
