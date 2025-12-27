import PsdToPhaserPlugin from '../../../../PsdToPhaser';
import { attachAttributes } from '../../../shared/attachAttributes';

import type { DefaultSpriteLayer } from '../../../../types';

export function placeDefaultSprite(
  scene: Phaser.Scene,
  layer: DefaultSpriteLayer,
  _plugin: PsdToPhaserPlugin,
  _psdKey: string,
  textureKey?: string
): Phaser.GameObjects.Sprite {
  const gameObject = scene.add.sprite(layer.x, layer.y, textureKey || layer.name);
  gameObject.setName(layer.name);
  gameObject.setOrigin(0, 0);
  gameObject.setDepth(layer.initialDepth ?? 0);

  attachAttributes(layer, gameObject);

  if (layer.frame !== undefined) {
    gameObject.setFrame(layer.frame);
  }

  return gameObject;
}