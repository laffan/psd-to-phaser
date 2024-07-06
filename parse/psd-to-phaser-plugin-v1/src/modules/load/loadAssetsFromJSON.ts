// import { loadSprites } from './loadSprites';
import { flattenObjects } from './flattenObjects';
import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';

export function loadAssetsFromJSON(scene: Phaser.Scene, key: string, data: any, plugin: PsdToPhaserPlugin): void {
    const spritesToLoad = flattenObjects(data.sprites);
    const tilesToLoad = data.tiles || {};

    const totalAssets = spritesToLoad.length; // Removed tile counting for now
    let loadedAssets = 0;

    if (plugin.options.debug) {
        console.log(`Total assets to load: ${totalAssets}`);
    }

    const updateProgress = () => {
        loadedAssets++;
        const progress = loadedAssets / totalAssets;
        scene.events.emit('psdAssetsLoadProgress', progress);

        if (plugin.options.debug) {
            console.log(`Loaded asset ${loadedAssets} of ${totalAssets}`);
            console.log(`Loading progress: ${(progress * 100).toFixed(2)}%`);
        }

        if (loadedAssets === totalAssets) {
            scene.events.emit('psdAssetsLoadComplete');

            if (plugin.options.debug) {
                console.log('All PSD assets loaded');
            }
        }
    };

    // if (spritesToLoad.length > 0) {
    //     loadSprites(scene, spritesToLoad, data.basePath, updateProgress);
    // }

    // Removed tile loading for now

    if (totalAssets === 0) {
        scene.events.emit('psdAssetsLoadComplete');
    }

    if (!scene.load.isLoading()) {
        scene.load.start();
    }
}