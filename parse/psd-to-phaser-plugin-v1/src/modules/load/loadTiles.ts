/**
 * loadTiles
 * Loads tile assets from the PSD data.
 * 
 * @param {Phaser.Scene} scene - The Phaser scene to load tiles into.
 * @param {Object} tiles - Tile data object.
 * @param {string} basePath - The base path for tile assets.
 * @param {Function} onProgress - Callback function to update loading progress.
 * 
 * @fires Phaser.Scene#filecomplete-image-{tileKey}
 */

export function loadTiles(scene: Phaser.Scene, tiles: any[], onProgress: () => void, debug: boolean): void {
    tiles.forEach(({ key, path }) => {
        scene.load.image(key, path);

        scene.load.once(`filecomplete-image-${key}`, () => {
            onProgress();
        });

        if (debug) {
            console.log(`Loading tile: ${key} from ${path}`);
        }
    });
}