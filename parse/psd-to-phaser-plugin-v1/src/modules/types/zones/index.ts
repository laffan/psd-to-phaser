/**
 * Zones Module
 * Handles zone-related functionality for the PSD to Phaser plugin.
 *
 * @module
 *
 * @method place
 * @param {Phaser.Scene} scene - The Phaser scene to place the zone in.
 * @param {string} zonePath - The path of the zone in the PSD data.
 * @param {string} psdKey - The key of the PSD data.
 * @param {Object} options - Additional options for placing the zone.
 * @return {Object | null} - The placed zone object or null if not found.
 *
 * @method placeAll
 * @param {Phaser.Scene} scene - The Phaser scene to place all zones in.
 * @param {string} psdKey - The key of the PSD data.
 * @param {Object} options - Additional options for placing the zones.
 * @return {Object[]} - Array of placed zone objects.
 *
 * @method get
 * @param {string} psdKey - The key of the PSD data.
 * @param {string} path - The path of the zone to retrieve.
 * @return {Object | null} - The retrieved zone object or null if not found.
 *
 * @method countZones
 * @param {Object[]} zones - Array of zone objects.
 * @return {number} - The total count of zones, including nested ones.
 */

import PsdToPhaserPlugin from "../../../PsdToPhaserPlugin";
import { createDebugShape, getShapeCenter } from '../../utils/debugVisualizer';

export default function zonesModule(plugin: PsdToPhaserPlugin) {
  return {
    place(
      scene: Phaser.Scene,
      psdKey: string,
      zonePath: string,
      options: any = {}
    ): Phaser.GameObjects.Zone | null {
      const psdData = plugin.getData(psdKey);
      if (!psdData) {
        console.error(`PSD data for key '${psdKey}' not found.`);
        return null;
      }

      const zone = this.getZoneByPath(psdData.zones, zonePath);
      if (!zone) {
        console.error(`Zone '${zonePath}' not found in PSD data.`);
        return null;
      }

      return this.placeZone(scene, zone, options);
    },

    placeAll(
      scene: Phaser.Scene,
      psdKey: string,
      options: any = {}
    ): Phaser.GameObjects.Zone[] {
      const psdData = plugin.getData(psdKey);
      if (!psdData) {
        console.error(`PSD data for key '${psdKey}' not found.`);
        return [];
      }

      return this.placeZonesRecursively(scene, psdData.zones, options);
    },

    get(
      scene: Phaser.Scene,
      psdKey: string,
      zonePath?: string,
      options: any = {}
    ): any {
      const psdData = plugin.getData(psdKey);
      if (!psdData) {
        console.error(`PSD data for key '${psdKey}' not found.`);
        return null;
      }

      if (!zonePath) {
        return this.getAllZones(psdData.zones);
      }

      const zone = this.getZoneByPath(psdData.zones, zonePath);
      if (!zone) {
        console.error(`Zone '${zonePath}' not found in PSD data.`);
        return null;
      }

      if (options.debug) {
        console.log(`Zone '${zonePath}' data:`, zone);
      }

      if (zone.children) {
        return {
          ...zone,
          zones: options.recursive
            ? this.getZonesRecursively(zone)
            : zone.children,
        };
      } else {
        return zone;
      }
    },

    placeZone(
      scene: Phaser.Scene,
      zone: any,
      options: any = {}
    ): Phaser.GameObjects.Zone | null {
      if (zone.children) {
        return null; // Don't place parent zones
      }

      const shape = this.createZoneShape(zone);
      let zoneObject: Phaser.GameObjects.Zone;

      if (shape instanceof Phaser.Geom.Polygon) {
        const bounds = Phaser.Geom.Polygon.GetAABB(shape);
        zoneObject = scene.add.zone(
          bounds.x,
          bounds.y,
          bounds.width,
          bounds.height
        );
      } else {
        zoneObject = scene.add.zone(
          shape.x,
          shape.y,
          shape.width,
          shape.height
        );
      }

      zoneObject.setName(zone.name);

      // Set custom properties
      Object.keys(zone).forEach((key) => {
        if (!["name", "subpaths", "bbox", "children"].includes(key)) {
          zoneObject.setData(key, zone[key]);
        }
      });

      if (options.debug || plugin.options.debug) {
        this.createDebugVisualization(scene, shape, zone);
      }

      return zoneObject;
    },
    placeZonesRecursively(
      scene: Phaser.Scene,
      zones: any[],
      options: any = {}
    ): Phaser.GameObjects.Zone[] {
      let placedZones: Phaser.GameObjects.Zone[] = [];

      zones.forEach((zone) => {
        const placedZone = this.placeZone(scene, zone, options);
        if (placedZone) {
          placedZones.push(placedZone);
        }

        if (zone.children) {
          placedZones = placedZones.concat(
            this.placeZonesRecursively(scene, zone.children, options)
          );
        }
      });

      return placedZones;
    },

    getZoneByPath(zones: any[], path: string): any | null {
      const pathParts = path.split("/");
      let current = zones.find((z) => z.name === pathParts[0]);

      for (let i = 1; i < pathParts.length; i++) {
        if (!current || !current.children) return null;
        current = current.children.find((c: any) => c.name === pathParts[i]);
      }

      return current;
    },

    getZonesRecursively(zone: any): any[] {
      let zones = zone.children ? [] : [zone];
      if (zone.children) {
        zone.children.forEach((child: any) => {
          zones = zones.concat(this.getZonesRecursively(child));
        });
      }
      return zones;
    },

    getAllZones(zones: any[]): any[] {
      return this.getZonesRecursively({ children: zones });
    },

    createZoneShape(zone: any): Phaser.Geom.Polygon | Phaser.Geom.Rectangle {
      if (zone.subpaths && zone.subpaths.length > 0) {
        const points = zone.subpaths[0].flatMap(
          (point: number[]) => new Phaser.Geom.Point(point[0], point[1])
        );
        return new Phaser.Geom.Polygon(points);
      } else {
        // Fallback to bbox if subpaths are not available
        return new Phaser.Geom.Rectangle(
          zone.bbox.left,
          zone.bbox.top,
          zone.bbox.right - zone.bbox.left,
          zone.bbox.bottom - zone.bbox.top
        );
      }
    },

    createDebugVisualization(
      scene: Phaser.Scene,
      shape: Phaser.Geom.Polygon | Phaser.Geom.Rectangle,
      zone: any
    ): void {
      const center = getShapeCenter(shape);
      createDebugShape(scene, "zone", center.x, center.y, {
        name: zone.name,
        color: 0x00ff00,
        shape: shape,
      });
    },
  };
}
