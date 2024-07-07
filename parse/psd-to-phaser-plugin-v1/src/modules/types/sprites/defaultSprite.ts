import { SpriteData } from '../../types';

export function placeSprite(scene: Phaser.Scene, sprite: SpriteData, options: any = {}, fullPath: string): Phaser.GameObjects.Sprite {
    const gameObject = scene.add.sprite(sprite.x, sprite.y, fullPath);
    gameObject.setName(sprite.name);
    gameObject.setDepth(sprite.layerOrder);
    gameObject.setOrigin(0, 0);

    if (options.debug) {
        console.log(`Placed sprite: ${sprite.name} at (${sprite.x}, ${sprite.y}), depth: ${sprite.layerOrder}`);
    }

    return gameObject;
}