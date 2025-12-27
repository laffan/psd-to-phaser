import PsdToPhaserPlugin from '../../../../PsdToPhaser';
import { attachAttributes } from '../../../shared/attachAttributes';
import { applyMaskToGameObject } from '../../../shared/applyMask';

import type { AtlasSpriteLayer, SpriteInstance } from '../../../../types';

export function placeAtlas(
  scene: Phaser.Scene,
  layer: AtlasSpriteLayer,
  _plugin: PsdToPhaserPlugin,
  _psdKey: string,
  textureKey?: string
): Phaser.GameObjects.Group {
  const group = scene.add.group();
  group.name = layer.name;

  const actualTextureKey = textureKey || layer.name;
  if (scene.textures.exists(actualTextureKey)) {
    const texture = scene.textures.get(actualTextureKey);
    const frames = texture.getFrameNames();

    if (layer.instances) {
      layer.instances.forEach((instance: SpriteInstance) => {
        const { name, x, y } = instance;
        if (frames.includes(name)) {
          const spriteObject = scene.add.sprite(x, y, actualTextureKey, name);
          spriteObject.setName(name);
          spriteObject.setOrigin(0, 0);
          group.add(spriteObject);
          spriteObject.setDepth(layer.initialDepth ?? 0);
        } else {
          console.warn(`Frame "${name}" not found in atlas "${actualTextureKey}"`);
        }
      });
    }
  } else {
    console.error(`Texture "${actualTextureKey}" not found. Make sure the atlas is loaded correctly.`);
  }

  group.setDepth(layer.initialDepth ?? 0);
  attachAttributes(layer, group);

  // Apply bitmap mask to all children in the group if layer has one
  if (layer.mask && layer.maskPath) {
    group.getChildren().forEach((child) => {
      applyMaskToGameObject(scene, layer, child as Phaser.GameObjects.Sprite);
    });
  }

  return group;
}