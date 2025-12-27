import PsdToPhaserPlugin from "../../../PsdToPhaser";
import { attachAttributes } from "../../shared/attachAttributes";
import { addDebugVisualization } from "../../shared/debugVisualizer";

import type { PointLayer } from "../../../types";

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
