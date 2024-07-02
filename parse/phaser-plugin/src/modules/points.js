// modules/points.js
import { createPSDObject } from "./psdObject";

export default function pointsModule(plugin) {
  return {
    place(scene, pointName, psdKey, options = {}) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.points) {
        console.warn(`Point data for key '${psdKey}' not found.`);
        return null;
      }

      const pointData = psdData.points.find((p) => p.name === pointName);
      if (!pointData) {
        console.warn(
          `Point '${pointName}' not found in PSD data for key '${psdKey}'.`
        );
        return null;
      }

      const point = createPSDObject(pointData);
      const debugGraphics = point.addDebugVisualization(
        scene,
        "point",
        plugin,
        options
      );

      if (plugin.options.debug) {
        console.log(`Placed point: ${pointName} at (${point.x}, ${point.y})`);
      }

      return { layerData: point, debugGraphics };
    },

    countPoints(points) {
      return Array.isArray(points) ? points.length : 0;
    },
  };
}
