import { SpriteData } from '../../types';

export function placeAtlas(scene: Phaser.Scene, atlasData: SpriteData, options: any = {}, fullPath: string): Phaser.GameObjects.Container {
    const container = scene.add.container(atlasData.x, atlasData.y);
    container.setName(atlasData.name);

    atlasData.placement.forEach((piece) => {
        const { frame, x, y, layerOrder, instanceName } = piece;
        const sprite = scene.add.sprite(x, y, fullPath, frame);
        sprite.setName(instanceName);
        sprite.setOrigin(0, 0);
        container.add(sprite);
        sprite.setDepth(layerOrder);
    });

    container.setDepth(atlasData.layerOrder);

    return container;
}