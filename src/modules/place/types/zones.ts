/**
 * Zone layer placement – creates Phaser Zones from PSD vector shapes.
 *
 * Zones are invisible hit-test areas defined by polygon subpaths or
 * bounding boxes in the PSD. They carry their vertex data on a `"points"`
 * data key for use with `fillZone()`, joystick bounds, etc.
 *
 * @module place/types/zones
 */

import PsdToPhaserPlugin from '../../../PsdToPhaser';
import { attachAttributes } from '../../shared/attachAttributes';
import { addDebugVisualization } from '../../shared/debugVisualizer';

import type { ZoneLayer } from '../../../types';

/**
 * Place a zone layer as a Phaser Zone game object.
 *
 * Creates the zone from polygon subpaths or a bounding box, stores vertex
 * data on the `"points"` data key, and adds debug visualisation when enabled.
 *
 * @param scene - The Phaser scene
 * @param layer - The zone layer definition from the PSD manifest
 * @param plugin - Plugin instance (for debug settings)
 * @param group - Parent group to add the zone to
 * @param resolve - Callback to signal placement is complete
 * @param _psdKey - PSD key (unused for zones)
 *
 * @internal
 */
export function placeZones(
  scene: Phaser.Scene,
  layer: ZoneLayer,
  plugin: PsdToPhaserPlugin,
  group: Phaser.GameObjects.Group,
  resolve: () => void,
  _psdKey: string
): void {
  const zoneObject = createZone(scene, layer);
  if (zoneObject) {
    group.add(zoneObject);

    // Create a separate debug group
    const debugGroup = scene.add.group();
    const zoneShape = createZoneShape(layer);
    addDebugVisualization(scene, plugin, debugGroup, {
      type: 'zone',
      name: layer.name,
      x: layer.x,
      y: layer.y,
      zoneShape,
    });
    // Add the debug group as a child of the main group, but don't include it in the group's children array
    (group as any).debugGroup = debugGroup;
  }
  resolve();
}

/**
 * Create a Zone game object from a zone layer definition.
 * Stores polygon vertices on the `"points"` data key.
 *
 * @internal
 */
function createZone(scene: Phaser.Scene, zone: ZoneLayer): Phaser.GameObjects.Zone | null {
  const shape = createZoneShape(zone);
  let zoneObject: Phaser.GameObjects.Zone;
  let points: Phaser.Math.Vector2[];

  if (shape instanceof Phaser.Geom.Polygon) {
    const bounds = Phaser.Geom.Polygon.GetAABB(shape);
    zoneObject = scene.add.zone(bounds.x, bounds.y, bounds.width, bounds.height);
    points = shape.points;
  } else {
    zoneObject = scene.add.zone(shape.x, shape.y, shape.width, shape.height);
    points = [
      new Phaser.Math.Vector2(shape.x, shape.y),
      new Phaser.Math.Vector2(shape.x + shape.width, shape.y),
      new Phaser.Math.Vector2(shape.x + shape.width, shape.y + shape.height),
      new Phaser.Math.Vector2(shape.x, shape.y + shape.height)
    ];
  }

  zoneObject.setName(zone.name || "unnamed_zone");
  attachAttributes(zone, zoneObject);

  // Set the points array as a custom property
  zoneObject.setData('points', points);

  // Set custom properties from zone data
  zoneObject.setData('category', zone.category);
  zoneObject.setData('x', zone.x);
  zoneObject.setData('y', zone.y);
  zoneObject.setData('width', zone.width);
  zoneObject.setData('height', zone.height);
  if (zone.initialDepth !== undefined) {
    zoneObject.setData('initialDepth', zone.initialDepth);
  }
  if (zone.attributes) {
    zoneObject.setData('attributes', zone.attributes);
  }

  return zoneObject;
}

/**
 * Build a geometry shape (Polygon or Rectangle) from a zone's subpath
 * or bounding box data.
 *
 * @internal
 */
function createZoneShape(zone: ZoneLayer): Phaser.Geom.Polygon | Phaser.Geom.Rectangle {
  if (zone.subpaths && Array.isArray(zone.subpaths) && zone.subpaths.length > 0 && Array.isArray(zone.subpaths[0])) {
    const points = zone.subpaths[0].flatMap((point: number[]) => new Phaser.Math.Vector2(point[0], point[1]));
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
