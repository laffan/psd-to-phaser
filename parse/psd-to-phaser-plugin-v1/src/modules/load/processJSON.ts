import { createPSDObject } from '../core/PSDObject';
import { loadAssetsFromJSON } from './loadAssetsFromJSON';
import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';

export function processJSON(scene: Phaser.Scene, key: string, data: any, psdFolderPath: string, plugin: PsdToPhaserPlugin): void {
    console.log(`Processing JSON for key: ${key}`);
    
    if (!data) {
        console.error(`Data is null or undefined for key: ${key}`);
        return;
    }

    if (!data.sprites || !Array.isArray(data.sprites)) {
        console.error(`Invalid or missing sprites data for key: ${key}`);
        return;
    }

    const processedData = {
        ...data,
        basePath: psdFolderPath,
        sprites: data.sprites.map((spriteData: any) => createPSDObject(spriteData)),
        zones: Array.isArray(data.zones) ? data.zones.map((zoneData: any) => createPSDObject(zoneData)) : [],
        points: Array.isArray(data.points) ? data.points.map((pointData: any) => createPSDObject(pointData)) : [],
    };

    plugin.setData(key, processedData);

    if (plugin.options.debug) {
        console.log(`Processed JSON for key "${key}":`, processedData);
    }

    loadAssetsFromJSON(scene, key, processedData, plugin);
}