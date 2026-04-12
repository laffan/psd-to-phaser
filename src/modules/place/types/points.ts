/**
 * Point layer placement – creates invisible container markers at PSD-defined
 * coordinates. Useful for spawn points, waypoints, or other positional data.
 *
 * @module place/types/points
 */

import PsdToPhaserPlugin from "../../../PsdToPhaser";
import { attachAttributes } from "../../shared/attachAttributes";
import { addDebugVisualization } from "../../shared/debugVisualizer";

import type { PointLayer } from "../../../types";

/**
 * Place a point layer as a Phaser Container at the defined x/y position.
 *
 * The container carries the original layer data on a `"pointData"` data key
 * and is added to the parent group. Debug visualisation (a small circle
 * and label) is added when debug mode is enabled.
 *
 * @param scene - The Phaser scene
 * @param layer - The point layer definition from the PSD manifest
 * @param plugin - Plugin instance (for debug settings)
 * @param group - Parent group to add the point to
 * @param resolve - Callback to signal placement is complete
 * @param _psdKey - PSD key (unused for points, reserved for consistency)
 *
 * @internal
 */
export function placePoints(
  scene: Phaser.Scene,
  layer: PointLayer,
  plugin: PsdToPhaserPlugin,
  group: Phaser.GameObjects.Group,
  resolve: () => void,
  _psdKey: string
): void {
  const pointObject = createPoint(scene, layer);
  if (pointObject) {
    group.add(pointObject);

    // Create a separate debug group
    const debugGroup = scene.add.group();
    addDebugVisualization(scene, plugin, debugGroup, {
      type: 'point',
      name: layer.name,
      x: layer.x,
      y: layer.y,
    });
    // Add the debug group as a child of the main group, but don't include it in the group's children array
    (group as any).debugGroup = debugGroup;
  }
  resolve();
}

/**
 * Create a Container game object representing a point.
 *
 * @internal
 */
function createPoint(
  scene: Phaser.Scene,
  layer: PointLayer
): Phaser.GameObjects.Container {
  const pointObject = scene.add.container(layer.x, layer.y);
  pointObject.setData("pointData", layer);
  pointObject.setName(layer.name);
  attachAttributes(layer, pointObject);

  return pointObject;
}
