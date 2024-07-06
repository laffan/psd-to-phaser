/**
 * Load Module
 * Handles asset loading functionality for the PSD to Phaser plugin.
 * 
 * @module
 * @exports loadAssets
 * @exports loadSprites
 * @exports loadTiles
 */

import { processJSON } from './processJSON';
import { loadAssetsFromJSON } from './loadAssetsFromJSON';
import { flattenObjects } from './flattenObjects';
import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';

export default function loadModule(plugin: PsdToPhaserPlugin) {
    let progress = 0;
    let complete = false;
    let lazyLoadQueue: any[] = [];
    let totalAssets = 0;
    let loadedAssets = 0;

    return {
        load(scene: Phaser.Scene, key: string, psdFolderPath: string): void {
            const jsonPath = `${psdFolderPath}/data.json`;
            scene.load.json(key, jsonPath);
            scene.load.once('complete', () => {
                const data = scene.cache.json.get(key);
                processJSON(scene, key, data, psdFolderPath, plugin);
            });
        },

        processJSON,
        loadAssetsFromJSON,
        flattenObjects,

        getLazyLoadQueue(): any[] {
            return lazyLoadQueue;
        },

        get progress(): number {
            return progress;
        },

        get complete(): boolean {
            return complete;
        },
    };
}