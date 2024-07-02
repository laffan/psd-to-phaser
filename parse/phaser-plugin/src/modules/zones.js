// modules/zonesModule.js

export default function zonesModule(plugin) {
  return {
    place(scene, zonePath, psdKey, options = {}) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.zones) {
        console.warn(`Zone data for key '${psdKey}' not found.`);
        return null;
      }

      const rootZone = psdData.zones.find((z) => zonePath.startsWith(z.name));
      if (!rootZone) {
        console.warn(
          `Zone '${zonePath}' not found in PSD data for key '${psdKey}'.`
        );
        return null;
      }

      const targetZone = rootZone.findByPath(zonePath);
      if (!targetZone) {
        console.warn(
          `Zone '${zonePath}' not found in PSD data for key '${psdKey}'.`
        );
        return null;
      }

      return this.placeZone(scene, targetZone, options);
    },

    placeZone(scene, zone, options = {}) {
      const { name, x, y, width, height } = zone;
      const zoneObject = scene.add.zone(x, y, width, height);

      if (!scene.physics || !scene.physics.world) {
        scene.physics.startSystem(Phaser.Physics.ARCADE);
      }
      scene.physics.add.existing(zoneObject, true); // true means it's static

      const debugGraphics = zone.addDebugVisualization(
        scene,
        "zone",
        plugin,
        options
      );

      if (plugin.options.debug) {
        console.log(
          `Placed zone: ${name} at (${x}, ${y}) with dimensions ${width}x${height}`
        );
      }

      const result = { layerData: zone, zoneObject, debugGraphics };

      if (zone.children) {
        result.children = zone.children.map((child) =>
          this.placeZone(scene, child, options)
        );
      }

      return result;
    },

    placeAll(scene, psdKey, options = {}) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.zones) {
        console.warn(`Zone data for key '${psdKey}' not found.`);
        return null;
      }

      return psdData.zones.map((rootZone) =>
        this.placeZone(scene, rootZone, options)
      );
    },

    countZones(zones) {
      return this.countZonesRecursive(zones);
    },

    countZonesRecursive(zones) {
      return zones.reduce((count, zone) => {
        let total = 1; // Count the current zone
        if (zone.children) {
          total += this.countZonesRecursive(zone.children);
        }
        return count + total;
      }, 0);
    },
  };
}
