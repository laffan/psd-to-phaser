
import PsdToPhaserPlugin from '../../../../PsdToPhaserPlugin';
import { attachAttributes } from '../../../shared/attachAttributes';

export function placeAnimation(
  scene: Phaser.Scene,
  layer: any,
  plugin: PsdToPhaserPlugin,
  psdKey: string,
  textureKey?: string
): Phaser.GameObjects.Sprite {
  const actualTextureKey = textureKey || layer.name;
  const gameObject = scene.add.sprite(layer.x, layer.y, actualTextureKey, 0);
  gameObject.setName(layer.name);
  gameObject.setOrigin(0, 0);
  gameObject.setDepth(layer.initialDepth || 0);
  attachAttributes( layer, gameObject)

  if (layer.frame_width && layer.frame_height) {
    const animConfig: Phaser.Types.Animations.Animation = {
      key: actualTextureKey,
      frames: scene.anims.generateFrameNumbers(actualTextureKey, {
        start: 0,
        end: layer.frame_count ? layer.frame_count - 1 : -1,
      }),
      frameRate: layer.attributes.frameRate || 24,
      repeat: layer.attributes.repeat !== undefined ? layer.repeat : -1,
    };

    if (!scene.anims.exists(actualTextureKey)) {
      scene.anims.create(animConfig);
    }

    gameObject.play(actualTextureKey);
  }

  return gameObject;
}