/**
 * Layer lookup utility – resolves a slash-delimited path to a layer
 * within the PSD layer hierarchy.
 *
 * @module shared/findLayer
 */

import type { PsdLayer } from '../../types';
import { isGroupLayer } from '../../types';

/**
 * Walk a layer tree to find the layer matching a slash-delimited path.
 *
 * Each path segment is matched against layer names at the current depth.
 * When a segment matches a group, the search continues into its children.
 *
 * @param layers - The array of layers to search
 * @param pathParts - Path segments (e.g. `["groupName", "spriteName"]`)
 * @returns The matching layer, or `null` if not found
 *
 * @example
 * ```ts
 * const layer = findLayer(psdData.original.layers, ["root", "background"]);
 * ```
 *
 * @internal
 */
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
