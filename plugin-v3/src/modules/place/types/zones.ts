import PsdToPhaserPlugin from '../../../PsdToPhaserPlugin';

export function placeZones(
  scene: Phaser.Scene,
  zoneData: any,
  plugin: PsdToPhaserPlugin,
  group: Phaser.GameObjects.Group,
  resolve: () => void,
  psdKey: string
): void {
  const zoneObject = createZone(scene, zoneData);
  if (zoneObject) {
    group.add(zoneObject);
    addDebugVisualization(scene, zoneData, group, plugin);
  }
  resolve();
}

function createZone(scene: Phaser.Scene, zone: any): Phaser.GameObjects.Zone | null {
  if (!zone || zone.children) {
    return null; // Don't create zones for groups
  }

  const shape = createZoneShape(zone);
  let zoneObject: Phaser.GameObjects.Zone;

  if (shape instanceof Phaser.Geom.Polygon) {
    const bounds = Phaser.Geom.Polygon.GetAABB(shape);
    zoneObject = scene.add.zone(bounds.x, bounds.y, bounds.width, bounds.height);
  } else {
    zoneObject = scene.add.zone(shape.x, shape.y, shape.width, shape.height);
  }

  zoneObject.setName(zone.name || "unnamed_zone");

  // Set custom properties
  Object.keys(zone).forEach((key) => {
    if (!["name", "subpaths", "bbox", "children"].includes(key)) {
      zoneObject.setData(key, zone[key]);
    }
  });

  return zoneObject;
}

function createZoneShape(zone: any): Phaser.Geom.Polygon | Phaser.Geom.Rectangle {
  if (zone.subpaths && Array.isArray(zone.subpaths) && zone.subpaths.length > 0 && Array.isArray(zone.subpaths[0])) {
    const points = zone.subpaths[0].flatMap((point: number[]) => new Phaser.Geom.Point(point[0], point[1]));
    return new Phaser.Geom.Polygon(points);
  } else if (zone.bbox && typeof zone.bbox === "object") {
    const { left, top, right, bottom } = zone.bbox;
    if (typeof left === "number" && typeof top === "number" && typeof right === "number" && typeof bottom === "number") {
      return new Phaser.Geom.Rectangle(left, top, right - left, bottom - top);
    }
  }
  console.error("Unable to create zone shape. Invalid zone data:", zone);
  return new Phaser.Geom.Rectangle(0, 0, 1, 1); // Return a default rectangle
}

function addDebugVisualization(
  scene: Phaser.Scene,
  zoneData: any,
  group: Phaser.GameObjects.Group,
  plugin: PsdToPhaserPlugin
): void {
  const debugDepth = 1000;

  if (plugin.isDebugEnabled('shape')) {
    const shape = createZoneShape(zoneData);
    const graphics = scene.add.graphics();
    graphics.lineStyle(2, 0x0000ff, 1);
    
    if (shape instanceof Phaser.Geom.Polygon) {
      graphics.strokePoints(shape.points, true);
    } else {
      graphics.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }
    
    graphics.setDepth(debugDepth);
    group.add(graphics);
  }

  if (plugin.isDebugEnabled('label')) {
    const shape = createZoneShape(zoneData);
    let x, y;
    if (shape instanceof Phaser.Geom.Polygon) {
      const bounds = Phaser.Geom.Polygon.GetAABB(shape);
      x = bounds.centerX;
      y = bounds.centerY;
    } else {
      x = shape.centerX;
      y = shape.centerY;
    }
    const text = scene.add.text(x, y, zoneData.name, {
      fontSize: '16px',
      color: '#0000ff',
      backgroundColor: '#ffffff'
    });
    text.setOrigin(0.5);
    text.setDepth(debugDepth);
    group.add(text);
  }
}