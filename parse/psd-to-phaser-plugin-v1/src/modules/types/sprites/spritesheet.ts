import { SpriteData } from '../../types';

export function placeSpritesheet(scene: Phaser.Scene, spritesheetData: SpriteData, options: any = {}, fullPath: string): Phaser.GameObjects.Container {
    const container = scene.add.container(spritesheetData.x, spritesheetData.y);
    container.setName(spritesheetData.name);

    spritesheetData.placement.forEach((piece) => {
        const { frame, x, y, layerOrder, instanceName } = piece;
        const sprite = scene.add.sprite(x, y, fullPath, frame);
        sprite.setName(instanceName);
        sprite.setOrigin(0, 0);
        container.add(sprite);
        sprite.setDepth(layerOrder);

        if (options.debug) {
            console.log(`Placed spritesheet piece: ${instanceName} at (${x}, ${y}), frame: ${frame}, depth: ${layerOrder}`);
        }
    });

    container.setDepth(spritesheetData.layerOrder);

    if (options.debug) {
        console.log(`Placed spritesheet: ${spritesheetData.name} with ${spritesheetData.placement.length} pieces`);
    }

    return container;
}