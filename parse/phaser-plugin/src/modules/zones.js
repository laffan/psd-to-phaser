// modules/zonesModule.js
import { PSDObject } from './psdObject';

export default function zonesModule(plugin) {
    return {
        place(scene, zonePath, psdKey, options = {}) {
            const psdData = plugin.getData(psdKey);
            if (!psdData || !psdData.zones) {
                console.warn(`Zone data for key '${psdKey}' not found.`);
                return null;
            }

            return PSDObject.place(scene, psdData, 'zones', zonePath, this.placeZone.bind(this), options);
        },

        placeZone(scene, zone, options = {}) {
            const { name, bbox } = zone;
            const { left, top, right, bottom } = bbox;
            const width = right - left;
            const height = bottom - top;

            const zoneObject = scene.add.zone(left, top, width, height);
            zoneObject.setName(name);

            const debugGraphics = zone.createDebugBox(scene, 'zone', plugin, options);

            if (plugin.options.debug) {
                console.log(`Placed zone: ${name} at (${left}, ${top}) with dimensions ${width}x${height}`);
            }

            const result = { layerData: zone, zone: zoneObject, debugGraphics };

            if (zone.children) {
                result.children = zone.children.map(child => this.placeZone(scene, child, options));
            }

            return result;
        },

        placeAll(scene, psdKey, options = {}) {
            const psdData = plugin.getData(psdKey);
            if (!psdData || !psdData.zones) {
                console.warn(`Zone data for key '${psdKey}' not found.`);
                return null;
            }

            return psdData.zones.map(rootZone => 
                PSDObject.place(scene, psdData, 'zones', rootZone.name, this.placeZone.bind(this), options)
            );
        },

        get(psdKey, path) {
            const psdData = plugin.getData(psdKey);
            if (!psdData || !psdData.placedZones) {
                console.warn(`Placed zone data for key '${psdKey}' not found.`);
                return null;
            }

            return psdData.placedZones[path] || null;
        },

        countZones(zones) {
            return PSDObject.countRecursive(zones);
        }
    };
}