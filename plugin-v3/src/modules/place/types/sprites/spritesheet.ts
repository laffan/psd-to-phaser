import PsdToPhaserPlugin from '../../../../PsdToPhaserPlugin';

export function placeSpritesheet(
  scene: Phaser.Scene,
  sprite: any,
  plugin: PsdToPhaserPlugin,
  psdKey: string
): Phaser.GameObjects.Group {
  const group = scene.add.group();
  group.name = sprite.name;

  if (scene.textures.exists(sprite.name)) {
    const texture = scene.textures.get(sprite.name);
    const textureFrames = texture.getFrameNames();

    // Create a mapping of instance names to frame indices
    const frameMapping = Object.keys(sprite.frames).reduce((map, key, index) => {
      map[key] = index;
      return map;
    }, {});

    if (sprite.instances && Array.isArray(sprite.instances)) {
      sprite.instances.forEach((instance: any, index: number) => {
        const { name, x, y } = instance;
        const frameIndex = frameMapping[name];

        if (frameIndex !== undefined && frameIndex < textureFrames.length) {
          const frameName = textureFrames[frameIndex];
          const spriteObject = scene.add.sprite(x, y, sprite.name, frameName);
          spriteObject.setName(name);
          spriteObject.setOrigin(0, 0);
          group.add(spriteObject);
          spriteObject.setDepth(sprite.initialDepth || 0);

          if (plugin.isDebugEnabled('console')) {
            console.log(`Placed spritesheet instance: ${name}, at (${x}, ${y}), using frame: ${frameName}`);
          }
        } else {
          console.warn(`Frame for "${name}" not found in spritesheet "${sprite.name}"`);
        }
      });
    }
  } else {
    console.error(`Texture "${sprite.name}" not found. Make sure the spritesheet is loaded correctly.`);
  }

  group.setDepth(sprite.initialDepth || 0);
  return group;
}