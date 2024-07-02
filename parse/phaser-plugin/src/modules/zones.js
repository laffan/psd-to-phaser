// modules/zones.js
import { createPSDObject } from "./psdObject";

export default function zonesModule(plugin) {
  return {
    place(scene, zoneName, psdKey, options = {}) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.zones) {
        console.warn(`Zone data for key '${psdKey}' not found.`);
        return null;
      }

      const zoneData = psdData.zones.find((z) => z.name === zoneName);
      if (!zoneData) {
        console.warn(
          `Zone '${zoneName}' not found in PSD data for key '${psdKey}'.`
        );
        return null;
      }

      const zone = createPSDObject(zoneData);
      let zoneObject;

      const { left, top, right, bottom } = zone.bbox;
      const width = right - left;
      const height = bottom - top;

      zoneObject = scene.add.zone(left, top, width, height);

      // Enable physics if it's not already enabled
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
          `Placed zone: ${zoneName} at (${left}, ${top}) with dimensions ${width}x${height}`
        );
      }

      return { layerData: zone, zoneObject, debugGraphics };
    },

    countZones(zones) {
      return Array.isArray(zones) ? zones.length : 0;
    },
  };
}
