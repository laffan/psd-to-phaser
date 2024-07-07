import PsdToPhaserPlugin, { DebugOptions } from "../../../PsdToPhaserPlugin";
import { createDebugShape } from "../../utils/debugVisualizer";
import { getDebugOptions } from '../../utils/sharedUtils';

export default function pointsModule(plugin: PsdToPhaserPlugin) {
  return {
    place(
      scene: Phaser.Scene,
      psdKey: string,
      pointPath: string,
      options: any = {}
    ): Phaser.GameObjects.GameObject[] {
      const psdData = plugin.getData(psdKey);
      if (!psdData) {
        console.error(`PSD data for key '${psdKey}' not found.`);
        return [];
      }

      const point = this.getPointByPath(psdData.points, pointPath);
      if (!point) {
        console.error(`Point '${pointPath}' not found in PSD data.`);
        return [];
      }

      const depth = options.depth !== undefined ? options.depth : Infinity;
      return this.placePointRecursively(scene, point, options, depth);
    },
    placePointsRecursively(
      scene: Phaser.Scene,
      points: any[],
      options: any = {}
    ): Phaser.GameObjects.GameObject[] {
      let placedPoints: Phaser.GameObjects.GameObject[] = [];

      points.forEach((point) => {
        const placedPoint = this.placePoint(scene, point, options);
        if (placedPoint) {
          placedPoints.push(placedPoint);
        }

        if (point.children) {
          placedPoints = placedPoints.concat(
            this.placePointsRecursively(scene, point.children, options)
          );
        }
      });

      return placedPoints;
    },

    placeAll(
      scene: Phaser.Scene,
      psdKey: string,
      options: any = {}
    ): Phaser.GameObjects.GameObject[] {
      const psdData = plugin.getData(psdKey);
      if (!psdData) {
        console.error(`PSD data for key '${psdKey}' not found.`);
        return [];
      }

      return this.placePointsRecursively(scene, psdData.points, options);
    },

    get(
      scene: Phaser.Scene,
      psdKey: string,
      pointPath?: string,
      options: any = {}
    ): any {
      const psdData = plugin.getData(psdKey);
      if (!psdData) {
        console.error(`PSD data for key '${psdKey}' not found.`);
        return null;
      }

      if (!pointPath) {
        return this.getAllPoints(psdData.points);
      }

      const point = this.getPointByPath(psdData.points, pointPath);
      if (!point) {
        console.error(`Point '${pointPath}' not found in PSD data.`);
        return null;
      }

      if (options.debug) {
        console.log(
          `Point '${pointPath}' coordinates: (${point.x}, ${point.y})`
        );
      }

      if (point.children) {
        return {
          x: point.x,
          y: point.y,
          ...this.getCustomAttributes(point),
          points: options.recursive
            ? this.getPointsRecursively(point)
            : point.children,
        };
      } else {
        return point;
      }
    },

    placePoint(
      scene: Phaser.Scene,
      point: any,
      options: any = {}
    ): Phaser.GameObjects.GameObject | null {
      if (point.children) {
        return null; // Don't visualize if it's a layer group
      }

           const debugOptions = getDebugOptions(options.debug, plugin.options.debug);
            if (debugOptions.shape) {
                return createDebugShape(scene, 'point', point.x, point.y, {
                    name: point.name,
                    color: 0xff0000,
                    radius: 5,
                    debugOptions
                });
            }

      // If debug shape is not enabled, don't create any visual representation
      return null;
    },

    placePointRecursively(
      scene: Phaser.Scene,
      point: any,
      options: any,
      depth: number
    ): Phaser.GameObjects.GameObject[] {
      let placedPoints: Phaser.GameObjects.GameObject[] = [];

      const pointObject = this.placePoint(scene, point, options);
      if (pointObject) {
        placedPoints.push(pointObject);
      }

      if (depth > 0 && point.children) {
        point.children.forEach((childPoint: any) => {
          placedPoints = placedPoints.concat(
            this.placePointRecursively(scene, childPoint, options, depth - 1)
          );
        });
      }

      return placedPoints;
    },

    getPointByPath(points: any[], path: string): any | null {
      const pathParts = path.split("/");
      let current = points;

      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        const found = current.find((p: any) => p.name === part);
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

    getPointsRecursively(point: any): any[] {
      let points = point.children ? [] : [point];
      if (point.children) {
        point.children.forEach((child: any) => {
          points = points.concat(this.getPointsRecursively(child));
        });
      }
      return points;
    },

    getAllPoints(points: any[]): any[] {
      return this.getPointsRecursively({ children: points });
    },

    getCustomAttributes(point: any): any {
      const customAttributes: any = {};
      for (const key in point) {
        if (!["x", "y", "name", "children"].includes(key)) {
          customAttributes[key] = point[key];
        }
      }
      return customAttributes;
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

      if (typeof globalDebug === "boolean") {
        defaultOptions.shape = globalDebug;
      } else if (typeof globalDebug === "object") {
        Object.assign(defaultOptions, globalDebug);
      }

      if (typeof localDebug === "boolean") {
        return localDebug
          ? { console: true, shape: true, label: true }
          : defaultOptions;
      } else if (typeof localDebug === "object") {
        return { ...defaultOptions, ...localDebug };
      }

      return defaultOptions;
    },
  };
}

