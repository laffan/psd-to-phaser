
import PsdToPhaserPlugin from '../../../../PsdToPhaserPlugin';

export function placeAnimation(
  scene: Phaser.Scene,
  sprite: any,
  plugin: PsdToPhaserPlugin,
  psdKey: string
): Phaser.GameObjects.Sprite {
  const gameObject = scene.add.sprite(sprite.x, sprite.y, sprite.name, 0);
  gameObject.setName(sprite.name);
  gameObject.setOrigin(0, 0);
  gameObject.setDepth(sprite.initialDepth || 0);

  if (sprite.frame_width && sprite.frame_height) {
    const animConfig: Phaser.Types.Animations.Animation = {
      key: sprite.name,
      frames: scene.anims.generateFrameNumbers(sprite.name, {
        start: 0,
        end: sprite.frame_count ? sprite.frame_count - 1 : -1,
      }),
      frameRate: sprite.frameRate || 24,
      repeat: sprite.repeat !== undefined ? sprite.repeat : -1,
    };

    if (!scene.anims.exists(sprite.name)) {
      scene.anims.create(animConfig);
    }

    gameObject.play(sprite.name);
  }

  return gameObject;
}