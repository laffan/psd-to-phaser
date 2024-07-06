import { loadSprites } from './loadSprites';
import { loadTiles } from './loadTiles';
import { flattenObjects } from './flattenObjects';
import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';

export function loadAssetsFromJSON(scene: Phaser.Scene, key: string, data: any, plugin: PsdToPhaserPlugin): void {
    const basePath = data.basePath;
    const spritesToLoad = getSpritesToLoad(data.sprites);
    const tilesToLoad = getTilesToLoad(data.tiles, basePath);

    const totalAssets = spritesToLoad.length + tilesToLoad.length;
    let loadedAssets = 0;

    if (plugin.options.debug) {
        console.log(`Total assets to load: ${totalAssets}`);
        console.log(`Sprites to load: ${spritesToLoad.length}`);
        console.log(`Tiles to load: ${tilesToLoad.length}`);
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

    if (spritesToLoad.length > 0) {
        loadSprites(scene, spritesToLoad, basePath, updateProgress, plugin.options.debug);
    }

    if (tilesToLoad.length > 0) {
        loadTiles(scene, tilesToLoad, updateProgress, plugin.options.debug);
    }

    if (totalAssets === 0) {
        scene.events.emit('psdAssetsLoadComplete');
        if (plugin.options.debug) {
            console.log('No assets to load');
        }
    }

    if (!scene.load.isLoading()) {
        scene.load.start();
    }
}

function getSpritesToLoad(sprites: any[]): any[] {
    return flattenObjects(sprites).filter(sprite => !isLazyLoaded(sprite.obj));
}

function getTilesToLoad(tiles: any, basePath: string): any[] {
    if (!tiles || !tiles.layers) return [];

    return tiles.layers.reduce((acc: any[], layer: any) => {
        if (isLazyLoaded(layer)) return acc;

        const tileSize = tiles.tile_slice_size;
        const fileExtension = layer.name === 'background' ? 'jpg' : 'png';

        for (let col = 0; col < tiles.columns; col++) {
            for (let row = 0; row < tiles.rows; row++) {
                const tileKey = `${layer.name}_tile_${col}_${row}`;
                const tilePath = `${basePath}/tiles/${tileSize}/${tileKey}.${fileExtension}`;
                acc.push({ key: tileKey, path: tilePath });
            }
        }

        return acc;
    }, []);
}

function isLazyLoaded(obj: any): boolean {
    return obj.lazyLoad === true;
}