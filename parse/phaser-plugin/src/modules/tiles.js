// modules/tiles.js
export default function tilesModule(plugin) {
    return {
        load(scene, tiles, basePath, onProgress) {
            if (!tiles || !tiles.layers || tiles.layers.length === 0) {
                console.warn("No tiles to load or invalid tiles data");
                return;
            }

            tiles.layers.forEach((layer) => {
                for (let col = 0; col < tiles.columns; col++) {
                    for (let row = 0; row < tiles.rows; row++) {
                        const tileKey = `${layer.name}_tile_${col}_${row}`;
                        const tilePath = `${basePath}/tiles/${tiles.tile_slice_size}/${tileKey}.jpg`;

                        scene.load.image(tileKey, tilePath);
                        scene.load.once(`filecomplete-image-${tileKey}`, onProgress);

                        if (plugin.options.debug) {
                            console.log(`Loading tile: ${tileKey} from ${tilePath}`);
                        }
                    }
                }
            });
        },

        create(scene, tiles) {
            // We won't automatically create tiles anymore
        },

        countTiles(tilesData) {
            if (!tilesData || !tilesData.layers) return 0;
            return tilesData.layers.length * tilesData.columns * tilesData.rows;
        },

        place(scene, layerName, psdKey) {
            const psdData = plugin.getData(psdKey);
            if (!psdData || !psdData.tiles) {
                console.warn(`Tiles data for key '${psdKey}' not found.`);
                return null;
            }

            const tilesData = psdData.tiles;
            const layer = tilesData.layers.find(l => l.name === layerName);
            if (!layer) {
                console.warn(`Tile layer '${layerName}' not found in PSD data for key '${psdKey}'.`);
                return null;
            }

            const container = scene.add.container(0, 0);

            for (let col = 0; col < tilesData.columns; col++) {
                for (let row = 0; row < tilesData.rows; row++) {
                    const tileKey = `${layerName}_tile_${col}_${row}`;
                    const x = col * tilesData.tile_slice_size;
                    const y = row * tilesData.tile_slice_size;

                    if (scene.textures.exists(tileKey)) {
                        const tile = scene.add.image(x, y, tileKey).setOrigin(0, 0);
                        container.add(tile);

                        if (plugin.options.debug) {
                            console.log(`Placed tile: ${tileKey} at (${x}, ${y})`);
                        }
                    } else {
                        console.warn(`Texture for tile ${tileKey} not found`);
                    }
                }
            }

            return container;
        }
    };
}