import type { PsdLayer } from '../../types';
import { isGroupLayer } from '../../types';

export function findLayer(layers: PsdLayer[], pathParts: string[]): PsdLayer | null {
  if (pathParts.length === 0) return null;
  const [current, ...rest] = pathParts;
  const found = layers.find((layer) => layer.name === current);
  if (!found) return null;
  if (rest.length === 0) return found;
  if (isGroupLayer(found)) {
    return findLayer(found.children, rest);
  }
  return null;
}
