/**
 * Attribute attachment utility – copies PSD layer attributes (custom
 * key/value pairs defined in the layer name) onto Phaser game objects.
 *
 * @module shared/attachAttributes
 */

import type { LayerAttributes } from '../../types';

/** Minimal interface for any layer-like object that may carry attributes. */
interface LayerWithAttributes {
  attributes?: LayerAttributes;
}

/**
 * Copy a layer's custom attributes onto a game object.
 *
 * Attributes originate from the PSD layer name (parsed by psd-to-json)
 * and may include animation parameters, lazyLoad flags, or arbitrary
 * user-defined key/value pairs.
 *
 * @param layerData - The layer data containing optional attributes
 * @param gameObject - The target game object to receive the attributes
 *
 * @internal
 */
export function attachAttributes(
  layerData: LayerWithAttributes,
  gameObject: object
): void {
  if (layerData.attributes) {
    (gameObject as Record<string, unknown>).attributes = layerData.attributes;
  }
}