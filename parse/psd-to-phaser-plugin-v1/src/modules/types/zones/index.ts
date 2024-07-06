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

import PsdToPhaserPlugin, { DebugOptions } from "../../../PsdToPhaserPlugin";
import { createDebugShape, getShapeCenter } from "../../utils/debugVisualizer";
import { getDebugOptions } from "../../utils/sharedUtils";

export default function zonesModule(plugin: PsdToPhaserPlugin) {
  return {
    place(
      scene: Phaser.Scene,
      psdKey: string,
      zonePath: string,
      options: any = {}
    ): Phaser.GameObjects.Zone[] | any {
      const psdData = plugin.getData(psdKey);
      if (!psdData) {
        console.error(`PSD data for key '${psdKey}' not found.`);
        return [];
      }

      const zoneOrGroup = this.getZoneByPath(psdData.zones, zonePath);
      if (!zoneOrGroup) {
        console.error(`Zone or group '${zonePath}' not found in PSD data.`);
        return [];
      }

      const depth = options.depth !== undefined ? options.depth : Infinity;
      return this.placeZoneRecursively(scene, zoneOrGroup, options, depth);
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

    get(psdKey: string, zonePath?: string, options: any = {}): any {
      const psdData = plugin.getData(psdKey);
      if (!psdData) {
        console.error(`PSD data for key '${psdKey}' not found.`);
        return null;
      }

      if (!zonePath) {
        return this.getAllZones(psdData.zones);
      }

      const zoneOrGroup = this.getZoneByPath(psdData.zones, zonePath);
      if (!zoneOrGroup) {
        console.error(`Zone or group '${zonePath}' not found in PSD data.`);
        return null;
      }

      if (zoneOrGroup.children) {
        return {
          ...this.getCustomAttributes(zoneOrGroup),
          zones: options.recursive
            ? this.getZonesRecursively(zoneOrGroup)
            : zoneOrGroup.children,
        };
      } else {
        return zoneOrGroup;
      }
    },

    placeZone(
      scene: Phaser.Scene,
      zone: any,
      options: any = {}
    ): Phaser.GameObjects.Zone | null {
      if (!zone || zone.children) {
        return null; // Don't place groups
      }

      try {
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

        zoneObject.setName(zone.name || "unnamed_zone");

        // Set custom properties
        Object.keys(zone).forEach((key) => {
          if (!["name", "subpaths", "bbox", "children"].includes(key)) {
            zoneObject.setData(key, zone[key]);
          }
        });

        const debugOptions = getDebugOptions(
          options.debug,
          plugin.options.debug
        );
        if (debugOptions.shape || debugOptions.label) {
          this.createDebugVisualization(scene, shape, zone, debugOptions);
        }

        return zoneObject;
      } catch (error) {
        console.error("Error placing zone:", error);
        console.error("Problematic zone data:", JSON.stringify(zone, null, 2));
        return null;
      }
    },
    placeZoneRecursively(
      scene: Phaser.Scene,
      zoneOrGroup: any,
      options: any,
      depth: number
    ): Phaser.GameObjects.Zone[] | any {
      if (zoneOrGroup.children) {
        // This is a group
        let placedZones: any[] = [];
        if (depth > 0) {
          zoneOrGroup.children.forEach((child: any) => {
            const result = this.placeZoneRecursively(
              scene,
              child,
              options,
              depth - 1
            );
            if (Array.isArray(result)) {
              placedZones = placedZones.concat(result);
            } else {
              placedZones.push(result);
            }
          });
        }
        return {
          ...this.getCustomAttributes(zoneOrGroup),
          zones: placedZones,
        };
      } else {
        // This is an actual zone
        const zoneObject = this.placeZone(scene, zoneOrGroup, options);
        return zoneObject ? [zoneObject] : [];
      }
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
      let current = zones;

      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        const found = current.find((z: any) => z.name === part);
        if (!found) return null;
        if (i === pathParts.length - 1) {
          return found;
        }
        if (found.children) {
          current = found.children;
        } else {
          return null;
        }
      }

      return null;
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
      if (!zone) {
        console.error("Zone is undefined or null");
        return new Phaser.Geom.Rectangle(0, 0, 1, 1); // Return a default rectangle
      }

      if (plugin.options.debug) {
        console.log("Zone data:", JSON.stringify(zone, null, 2));
      }

      if (
        zone.subpaths &&
        Array.isArray(zone.subpaths) &&
        zone.subpaths.length > 0 &&
        Array.isArray(zone.subpaths[0])
      ) {
        const points = zone.subpaths[0].flatMap(
          (point: number[]) => new Phaser.Geom.Point(point[0], point[1])
        );
        return new Phaser.Geom.Polygon(points);
      } else if (zone.bbox && typeof zone.bbox === "object") {
        const { left, top, right, bottom } = zone.bbox;
        if (
          typeof left === "number" &&
          typeof top === "number" &&
          typeof right === "number" &&
          typeof bottom === "number"
        ) {
          return new Phaser.Geom.Rectangle(
            left,
            top,
            right - left,
            bottom - top
          );
        } else {
          console.error("Invalid bbox values:", zone.bbox);
        }
      }

      console.error("Unable to create zone shape. Invalid zone data:", zone);
      return new Phaser.Geom.Rectangle(0, 0, 1, 1); // Return a default rectangle
    },
    getCustomAttributes(zone: any): any {
      const customAttributes: any = {};
      for (const key in zone) {
        if (!["name", "subpaths", "bbox", "children"].includes(key)) {
          customAttributes[key] = zone[key];
        }
      }
      return customAttributes;
    },
    createDebugVisualization(
      scene: Phaser.Scene,
      shape: Phaser.Geom.Polygon | Phaser.Geom.Rectangle,
      zone: any,
      debugOptions: DebugOptions
    ): void {
      const center = getShapeCenter(shape);
      createDebugShape(scene, "zone", center.x, center.y, {
        name: zone.name,
        color: 0x00ff00,
        shape: shape,
        debugOptions,
      });
    },

    getDebugOptions(
      localDebug: boolean | DebugOptions | undefined,
      globalDebug: boolean | DebugOptions
    ): DebugOptions {
      const defaultOptions: DebugOptions = {
        console: false,
        shape: false,
        label: false,
      };

      // Apply global debug settings
      if (typeof globalDebug === "boolean") {
        defaultOptions.console = globalDebug;
        defaultOptions.shape = globalDebug;
        defaultOptions.label = globalDebug;
      } else if (typeof globalDebug === "object") {
        Object.assign(defaultOptions, globalDebug);
      }

      // Apply local debug settings
      if (typeof localDebug === "boolean") {
        return localDebug
          ? { console: true, shape: true, label: true }
          : defaultOptions;
      } else if (typeof localDebug === "object") {
        // If a debug object is provided, default all options to true unless specifically set to false
        const localOptions: DebugOptions = {
          console: localDebug.console !== false,
          shape: localDebug.shape !== false,
          label: localDebug.label !== false,
        };
        return { ...defaultOptions, ...localOptions };
      }

      return defaultOptions;
    },
  };
}
