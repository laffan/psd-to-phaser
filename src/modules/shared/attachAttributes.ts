import type { LayerAttributes } from '../../types';

interface LayerWithAttributes {
  attributes?: LayerAttributes;
}

export function attachAttributes(
  layerData: LayerWithAttributes,
  gameObject: object
): void {
  if (layerData.attributes) {
    (gameObject as Record<string, unknown>).attributes = layerData.attributes;
  }
}