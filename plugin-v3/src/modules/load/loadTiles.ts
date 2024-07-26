
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