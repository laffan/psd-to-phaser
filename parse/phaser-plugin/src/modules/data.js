export default function dataModule(plugin) {
    let progress = 0;
    let complete = false;

    return {
        load(scene, key, psdFolderPath, config = {}) {
            const jsonPath = `${psdFolderPath}/data.json`;
            scene.load.json(key, jsonPath);
            scene.load.once("complete", () => {
                const data = scene.cache.json.get(key);
                this.processJSON(scene, key, data, psdFolderPath, config);
            });
        },

        processJSON(scene, key, data, psdFolderPath, config) {
            scene.game.registry.set(key, data);
            plugin.psdData[key] = data;

            if (plugin.options.debug) {
                console.log(`Loaded JSON for key "${key}":`, data);
            }

            if (!config.noPreloading) {
                this.loadAssetsFromJSON(scene, data, psdFolderPath);
            } else {
                complete = true;
                scene.events.emit('psdAssetsLoadComplete');
                if (plugin.options.debug) {
                    console.log('JSON loaded. Skipping asset preloading.');
                }
            }
        },

        loadAssetsFromJSON(scene, data, psdFolderPath) {
            const spritesToLoad = (data.sprites || []).filter(sprite => !sprite.lazyLoad);
            const tilesToLoad = (data.tiles || []).filter(tile => !tile.lazyLoad);

            let totalAssets = plugin.sprites.countSprites(spritesToLoad) + plugin.tiles.countTiles(tilesToLoad);
            let loadedAssets = 0;

            if (plugin.options.debug) {
                console.log(`Total assets to load: ${totalAssets}`);
                console.log(`Sprites to preload: ${spritesToLoad.length}`);
                console.log(`Tiles to preload: ${tilesToLoad.length}`);
            }

            // Load sprites
            if (spritesToLoad.length > 0) {
                plugin.sprites.load(scene, spritesToLoad, psdFolderPath);
            }

            // Load tiles
            if (tilesToLoad.length > 0) {
                plugin.tiles.load(scene, tilesToLoad, psdFolderPath);
            }

            // Set up a listener for asset load completion
            scene.load.on('filecomplete', () => {
                loadedAssets++;
                progress = loadedAssets / totalAssets;
                scene.events.emit('psdAssetsLoadProgress', progress);

                if (plugin.options.debug) {
                    console.log(`Loaded asset ${loadedAssets} of ${totalAssets}`);
                    console.log(`Loading progress: ${(progress * 100).toFixed(2)}%`);
                }
            });

            scene.load.on('complete', () => {
                complete = true;
                progress = 1;
                scene.events.emit('psdAssetsLoadComplete');

                if (plugin.options.debug) {
                    console.log('All preloaded PSD assets loaded');
                }

                // Create sprite game objects for preloaded sprites
                plugin.sprites.create(scene, spritesToLoad);
            });

            // Start loading
            scene.load.start();
        },

        get progress() {
            return progress;
        },

        get complete() {
            return complete;
        }
    };
}