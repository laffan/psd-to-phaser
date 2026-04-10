// src/modules/getMask.ts
// Phaser 4: BitmapMask replaced by Filter system

import PsdToPhaserPlugin from '../PsdToPhaser';
import { findLayer } from './shared/findLayer';
import { hasMask } from '../types';

/**
 * Result object from getMask containing the mask image.
 *
 * Phaser 4 migration: The bitmapMask field has been replaced with the maskImage.
 * Users should apply the mask via the Filter system:
 *   gameObject.filters.internal.addMask(result.maskImage)
 */
export interface MaskResult {
  /** The hidden image used to create the mask */
  maskImage: Phaser.GameObjects.Image;
}

export default function getMaskModule(plugin: PsdToPhaserPlugin) {
  /**
   * Get a mask image for a layer. The mask texture should already be loaded.
   *
   * In Phaser 4, apply the returned maskImage via the Filter system:
   *   gameObject.filters.internal.addMask(result.maskImage)
   *
   * @param scene - The Phaser scene
   * @param psdKey - The key used when loading the PSD
   * @param layerPath - Path to the layer (e.g., "GroupName/LayerName")
   * @returns MaskResult with the mask image, or null if no mask exists
   *
   * @example
   * const mask = psd.getMask(this, 'myPsd', 'Background/Trees');
   * if (mask) {
   *   mySprite.filters.internal.addMask(mask.maskImage);
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
      console.log(`Mask texture "${maskKey}" is being loaded. Call getMask again after load completes.`);
      return null;
    }

    // Create the mask image at the layer position
    const maskImage = scene.add.image(layerData.x, layerData.y, maskKey);
    maskImage.setOrigin(0, 0);
    maskImage.setVisible(false);

    return {
      maskImage,
    };
  };
}
