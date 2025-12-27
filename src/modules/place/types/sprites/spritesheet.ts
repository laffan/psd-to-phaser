import PsdToPhaserPlugin from "../../../../PsdToPhaser";
import {
  setupSpriteGroup,
  setupSpriteInstance,
  applyMaskToGroupChildren,
  getTextureKey,
} from "../../../shared/spriteSetup";

import type { SpritesheetLayer, SpriteInstance } from "../../../../types";

export function placeSpritesheet(
  scene: Phaser.Scene,
  layer: SpritesheetLayer,
  plugin: PsdToPhaserPlugin,
  _psdKey: string,
  textureKey?: string
): Phaser.GameObjects.Group {
  const group = scene.add.group();
  const actualTextureKey = getTextureKey(layer, textureKey);

  if (scene.textures.exists(actualTextureKey)) {
    const texture = scene.textures.get(actualTextureKey);
    const textureFrames = texture.getFrameNames();

    // Create a mapping of instance names to frame indices
    const frameMapping: Record<string, number> = Object.keys(
      layer.frames
    ).reduce((map, key, index) => {
      map[key] = index;
      return map;
    }, {} as Record<string, number>);

    if (layer.instances) {
      layer.instances.forEach((instance: SpriteInstance) => {
        const { name, x, y } = instance;
        const frameIndex = frameMapping[name];

        if (frameIndex !== undefined && frameIndex < textureFrames.length) {
          const frameName = textureFrames[frameIndex];
          const spriteObject = scene.add.sprite(x, y, actualTextureKey, frameName);
          setupSpriteInstance(spriteObject, name, layer.initialDepth ?? 0);
          group.add(spriteObject);

          if (plugin.isDebugEnabled("console")) {
            console.log(
              `Placed spritesheet instance: ${name}, at (${x}, ${y}), using frame: ${frameName}`
            );
          }
        } else {
          console.warn(
            `Frame for "${name}" not found in spritesheet "${actualTextureKey}"`
          );
        }
      });
    }
  } else {
    console.error(
      `Texture "${actualTextureKey}" not found. Make sure the spritesheet is loaded correctly.`
    );
  }

  setupSpriteGroup(layer, group);
  applyMaskToGroupChildren(scene, layer, group);

  return group;
}
