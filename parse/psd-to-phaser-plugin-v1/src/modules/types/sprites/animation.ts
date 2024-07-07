import { SpriteData, AnimationConfig } from '../../types';

export function placeAnimation(scene: Phaser.Scene, animationData: SpriteData, options: any = {}, fullPath: string): Phaser.GameObjects.Sprite {
    const sprite = scene.add.sprite(animationData.x, animationData.y, fullPath, 0);
    sprite.setName(animationData.name);
    sprite.setDepth(animationData.layerOrder);
    sprite.setOrigin(0, 0);

    const animConfig: AnimationConfig = {
        key: animationData.name,
        frames: scene.anims.generateFrameNumbers(fullPath, {}),
        frameRate: animationData.frameRate || 24,
        repeat: -1
    };

    ['yoyo', 'repeat', 'repeatDelay', 'duration'].forEach(prop => {
        if (animationData[prop] !== undefined) {
            animConfig[prop] = animationData[prop];
        }
    });

    scene.anims.create(animConfig);
    sprite.play(animationData.name);

    return sprite;
}

export function updateAnimation(scene: Phaser.Scene, spriteName: string, animationOptions: Partial<AnimationConfig>): void {
    const sprite = scene.children.getByName(spriteName) as Phaser.GameObjects.Sprite;
    if (!sprite) {
        console.error(`Sprite ${spriteName} not found`);
        return;
    }

    const currentAnim = sprite.anims.currentAnim;
    if (!currentAnim) {
        console.error(`No animation found for sprite ${spriteName}`);
        return;
    }

    const updatedConfig = { ...currentAnim.config, ...animationOptions };
    scene.anims.remove(currentAnim.key);
    scene.anims.create(updatedConfig);

    sprite.play(updatedConfig.key);
}