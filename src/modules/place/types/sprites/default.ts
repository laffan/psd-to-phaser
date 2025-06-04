import PsdToPhaserPlugin from '../../../../PsdToPhaser';
import { attachAttributes } from '../../../shared/attachAttributes';

export function placeDefaultSprite(
  scene: Phaser.Scene,
  layer: any,
  plugin: PsdToPhaserPlugin,
  psdKey: string,
  textureKey?: string
): Phaser.GameObjects.Sprite {
  const gameObject = scene.add.sprite(layer.x, layer.y, textureKey || layer.name);
  gameObject.setName(layer.name);
  gameObject.setOrigin(0, 0);
  gameObject.setDepth(layer.initialDepth || 0);

  attachAttributes( layer, gameObject)

  if (layer.frame !== undefined) {
    gameObject.setFrame(layer.frame);
  }

  return gameObject;
}