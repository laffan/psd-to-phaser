import { createPSDObject } from '../core/PSDObject';
import { loadAssetsFromJSON } from './loadAssetsFromJSON';
import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';

export function processJSON(scene: Phaser.Scene, key: string, data: any, psdFolderPath: string, plugin: PsdToPhaserPlugin): void {
    const processedData = {
        ...data,
        basePath: psdFolderPath,
        sprites: data.sprites.map((spriteData: any) => createPSDObject(spriteData)),
        zones: data.zones.map((zoneData: any) => createPSDObject(zoneData)),
        points: data.points.map((pointData: any) => createPSDObject(pointData)),
    };

    plugin.setData(key, processedData);

    if (plugin.options.debug) {
        console.log(`Loaded JSON for key "${key}":`, processedData);
    }

    loadAssetsFromJSON(scene, key, processedData, plugin);
}