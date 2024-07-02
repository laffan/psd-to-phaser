// modules/pointsModule.js
import { PSDObject } from "./psdObject";

export default function pointsModule(plugin) {
  return {
    place(scene, pointPath, psdKey, options = {}) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.points) {
        console.warn(`Point data for key '${psdKey}' not found.`);
        return null;
      }

      return PSDObject.place(
        scene,
        psdData,
        "points",
        pointPath,
        this.placePoint.bind(this),
        options
      );
    },

    placePoint(scene, point, options = {}) {
      const { name, x, y } = point;
      const pointObject = scene.add.circle(x, y, 5, 0xffffff, 1);
      pointObject.setName(name);

      const debugGraphics = point.createDebugBox(
        scene,
        "point",
        plugin,
        options
      );

      if (plugin.options.debug) {
        console.log(`Placed point: ${name} at (${x}, ${y})`);
      }

      const result = { layerData: point, point: pointObject, debugGraphics };

      if (point.children) {
        result.children = point.children.map((child) =>
          this.placePoint(scene, child, options)
        );
      }

      return result;
    },

    placeAll(scene, psdKey, options = {}) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.points) {
        console.warn(`Point data for key '${psdKey}' not found.`);
        return null;
      }

      return psdData.points.map((rootPoint) =>
        PSDObject.place(
          scene,
          psdData,
          "points",
          rootPoint.name,
          this.placePoint.bind(this),
          options
        )
      );
    },

    get(psdKey, path) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.placedPoints) {
        console.warn(`Placed point data for key '${psdKey}' not found.`);
        return null;
      }

      return psdData.placedPoints[path] || null;
    },

    countPoints(points) {
      return PSDObject.countRecursive(points);
    },
  };
}
