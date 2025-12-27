import PsdToPhaserPlugin from '../../../../PsdToPhaser';
import { setupSprite, getTextureKey } from '../../../shared/spriteSetup';

import type { DefaultSpriteLayer } from '../../../../types';

export function placeDefaultSprite(
  scene: Phaser.Scene,
  layer: DefaultSpriteLayer,
  _plugin: PsdToPhaserPlugin,
  _psdKey: string,
  textureKey?: string
): Phaser.GameObjects.Sprite {
  const actualTextureKey = getTextureKey(layer, textureKey);
  const gameObject = scene.add.sprite(layer.x, layer.y, actualTextureKey);

  setupSprite(scene, layer, gameObject);

  if (layer.frame !== undefined) {
    gameObject.setFrame(layer.frame);
  }

  return gameObject;
}
