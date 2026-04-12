/**
 * Atlas sprite placement – creates a Group of sprites from named atlas frames.
 *
 * An atlas is a single image containing multiple named sub-images (frames).
 * Each instance defined in the PSD manifest is placed at its own position
 * using the corresponding frame from the atlas texture.
 *
 * @module place/types/sprites/atlas
 */

import PsdToPhaserPlugin from '../../../../PsdToPhaser';
import {
  setupSpriteGroup,
  setupSpriteInstance,
  applyMaskToGroupChildren,
  getTextureKey,
} from '../../../shared/spriteSetup';

import type { AtlasSpriteLayer, SpriteInstance } from '../../../../types';

/**
 * Place an atlas sprite layer as a Group of individual frame sprites.
 *
 * Each instance in the layer definition gets its own Sprite using the
 * named frame from the atlas. A shared mask is applied to all children
 * if the layer has one.
 *
 * @param scene - The Phaser scene
 * @param layer - Atlas sprite layer definition
 * @param _plugin - Plugin instance (unused)
 * @param _psdKey - PSD key (unused)
 * @param textureKey - Override texture key (for loadMultiple namespacing)
 * @returns Group containing all placed atlas frame sprites
 *
 * @internal
 */
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
