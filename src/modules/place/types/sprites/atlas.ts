import PsdToPhaserPlugin from '../../../../PsdToPhaser';
import {
  setupSpriteGroup,
  setupSpriteInstance,
  applyMaskToGroupChildren,
  getTextureKey,
} from '../../../shared/spriteSetup';

import type { AtlasSpriteLayer, SpriteInstance } from '../../../../types';

export function placeAtlas(
  scene: Phaser.Scene,
  layer: AtlasSpriteLayer,
  _plugin: PsdToPhaserPlugin,
  _psdKey: string,
  textureKey?: string
): Phaser.GameObjects.Group {
  const group = scene.add.group();
  const actualTextureKey = getTextureKey(layer, textureKey);

  if (scene.textures.exists(actualTextureKey)) {
    const texture = scene.textures.get(actualTextureKey);
    const frames = texture.getFrameNames();

    if (layer.instances) {
      layer.instances.forEach((instance: SpriteInstance) => {
        const { name, x, y } = instance;
        if (frames.includes(name)) {
          const spriteObject = scene.add.sprite(x, y, actualTextureKey, name);
          setupSpriteInstance(spriteObject, name, layer.initialDepth ?? 0);
          group.add(spriteObject);
        } else {
          console.warn(`Frame "${name}" not found in atlas "${actualTextureKey}"`);
        }
      });
    }
  } else {
    console.error(`Texture "${actualTextureKey}" not found. Make sure the atlas is loaded correctly.`);
  }

  setupSpriteGroup(layer, group);
  applyMaskToGroupChildren(scene, layer, group);

  return group;
}
