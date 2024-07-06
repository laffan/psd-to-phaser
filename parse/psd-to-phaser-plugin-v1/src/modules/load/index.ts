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
    return {
        load(scene: Phaser.Scene, key: string, psdFolderPath: string): void {
            const jsonPath = `${psdFolderPath}/data.json`;
            console.log(`Attempting to load JSON from: ${jsonPath}`);

            scene.load.json(key, jsonPath);

            scene.load.once('filecomplete-json-' + key, (key: string, type: string, data: any) => {
                console.log(`JSON loaded successfully: ${key}`);
                if (data) {
                    processJSON(scene, key, data, psdFolderPath, plugin);
                } else {
                    console.error(`Loaded JSON is empty or invalid for key: ${key}`);
                }
            });

            scene.load.once('loaderror', (file: any) => {
                if (file.key === key) {
                    console.error(`Failed to load JSON file: ${jsonPath}`);
                }
            });

            if (!scene.load.isLoading()) {
                scene.load.start();
            }
        },

        processJSON,
        loadAssetsFromJSON,
        flattenObjects,
    };
}