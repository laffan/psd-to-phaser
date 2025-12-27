import PsdToPhaserPlugin from "../../../PsdToPhaser";
import { attachAttributes } from "../../shared/attachAttributes";

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
    addDebugVisualization(scene, layer, debugGroup, plugin);
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

function addDebugVisualization(
  scene: Phaser.Scene,
  layer: PointLayer,
  group: Phaser.GameObjects.Group,
  plugin: PsdToPhaserPlugin
): void {
  const debugDepth = 1000;

  if (plugin.isDebugEnabled("shape")) {
    const circle = scene.add.circle(layer.x, layer.y, 5, 0xff0000);
    circle.setStrokeStyle(2, 0xff0000);
    circle.setDepth(debugDepth);
    (circle as any).isDebugObject = true;
    group.add(circle);
  }

  if (plugin.isDebugEnabled("label")) {
    const text = scene.add.text(layer.x, layer.y - 20, layer.name, {
      fontSize: "16px",
      color: "#ff0000",
      backgroundColor: "#ffffff",
    });
    text.setOrigin(0.5, 1);
    text.setDepth(debugDepth);
    (text as any).isDebugObject = true;
    group.add(text);
  }
}