import PsdToPhaserPlugin from "../../../PsdToPhaserPlugin";

export function placePoints(
  scene: Phaser.Scene,
  pointData: any,
  plugin: PsdToPhaserPlugin,
  group: Phaser.GameObjects.Group,
  resolve: () => void,
  psdKey: string
): void {
  const pointObject = createPoint(scene, pointData, plugin);
  if (pointObject) {
    group.add(pointObject);
    
    // Create a separate debug group
    const debugGroup = scene.add.group();
    addDebugVisualization(scene, pointData, debugGroup, plugin);
    // Add the debug group as a child of the main group, but don't include it in the group's children array
    (group as any).debugGroup = debugGroup;
  }
  resolve();
}

function createPoint(
  scene: Phaser.Scene,
  point: any,
  plugin: PsdToPhaserPlugin
): Phaser.GameObjects.GameObject | null {
  if (point.children) {
    return null; // Don't create a visual representation for groups
  }

  const pointObject = new Phaser.GameObjects.GameObject(scene, "point");
  pointObject.x = point.x;
  pointObject.y = point.y;

  pointObject.setData("pointData", point);
  pointObject.setName(point.name); // Add this line

  return pointObject;
}

function addDebugVisualization(
  scene: Phaser.Scene,
  pointData: any,
  group: Phaser.GameObjects.Group,
  plugin: PsdToPhaserPlugin
): void {
  const debugDepth = 1000;

  if (plugin.isDebugEnabled("shape")) {
    const circle = scene.add.circle(pointData.x, pointData.y, 5, 0xff0000);
    circle.setStrokeStyle(2, 0xff0000);
    circle.setDepth(debugDepth);
    (circle as any).isDebugObject = true;
    group.add(circle);
  }

  if (plugin.isDebugEnabled("label")) {
    const text = scene.add.text(pointData.x, pointData.y - 20, pointData.name, {
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