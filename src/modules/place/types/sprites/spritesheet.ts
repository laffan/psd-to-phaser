import PsdToPhaserPlugin from "../../../../PsdToPhaser";
import { attachAttributes } from "../../../shared/attachAttributes";

export function placeSpritesheet(
  scene: Phaser.Scene,
  layer: any,
  plugin: PsdToPhaserPlugin,
  _psdKey: string,
  textureKey?: string
): Phaser.GameObjects.Group {
  const group = scene.add.group();
  group.name = layer.name;

  const actualTextureKey = textureKey || layer.name;
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

    if (layer.instances && Array.isArray(layer.instances)) {
      layer.instances.forEach((instance: any) => {
        const { name, x, y } = instance;
        const frameIndex = frameMapping[name];

        if (frameIndex !== undefined && frameIndex < textureFrames.length) {
          const frameName = textureFrames[frameIndex];
          const spriteObject = scene.add.sprite(x, y, actualTextureKey, frameName);
          spriteObject.setName(name);
          spriteObject.setOrigin(0, 0);
          group.add(spriteObject);
          spriteObject.setDepth(layer.initialDepth || 0);

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

  group.setDepth(layer.initialDepth || 0);
  attachAttributes( layer, group)
  
  return group;
}
