// modules/pointsModule.js

export default function pointsModule(plugin) {
  return {
    place(scene, pointPath, psdKey, options = {}) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.points) {
        console.warn(`Point data for key '${psdKey}' not found.`);
        return null;
      }

      const rootPoint = psdData.points.find((p) =>
        pointPath.startsWith(p.name)
      );
      if (!rootPoint) {
        console.warn(
          `Point '${pointPath}' not found in PSD data for key '${psdKey}'.`
        );
        return null;
      }

      const targetPoint = rootPoint.findByPath(pointPath);
      if (!targetPoint) {
        console.warn(
          `Point '${pointPath}' not found in PSD data for key '${psdKey}'.`
        );
        return null;
      }

      return this.placePoint(scene, targetPoint, options);
    },

    placePoint(scene, point, options = {}) {
      const { name, x, y } = point;
      const pointObject = scene.add.rectangle(x, y, 1, 1, 0xffffff, 0);

      const debugGraphics = point.addDebugVisualization(
        scene,
        "point",
        plugin,
        options
      );

      if (plugin.options.debug) {
        console.log(`Placed point: ${name} at (${x}, ${y})`);
      }

      const result = { layerData: point, pointObject, debugGraphics };

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
        this.placePoint(scene, rootPoint, options)
      );
    },

    countPoints(points) {
      return this.countPointsRecursive(points);
    },

    countPointsRecursive(points) {
      return points.reduce((count, point) => {
        let total = 1; // Count the current point
        if (point.children) {
          total += this.countPointsRecursive(point.children);
        }
        return count + total;
      }, 0);
    },
  };
}
