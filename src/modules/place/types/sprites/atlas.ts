import PsdToPhaserPlugin from '../../../../PsdToPhaser';
export function placeAtlas(
  scene: Phaser.Scene,
  layer: any,
  plugin: PsdToPhaserPlugin,
  psdKey: string,
  textureKey?: string
): Phaser.GameObjects.Group {
  const group = scene.add.group();
  group.name = layer.name;

  const actualTextureKey = textureKey || layer.name;
  if (scene.textures.exists(actualTextureKey)) {
    const texture = scene.textures.get(actualTextureKey);
    const frames = texture.getFrameNames();

    if (layer.instances && Array.isArray(layer.instances)) {
      layer.instances.forEach((instance: any) => {
        const { name, x, y } = instance;
        if (frames.includes(name)) {
          const spriteObject = scene.add.sprite(x, y, actualTextureKey, name);
          spriteObject.setName(name);
          spriteObject.setOrigin(0, 0);
          group.add(spriteObject);
          spriteObject.setDepth(layer.initialDepth || 0);

        } else {
          console.warn(`Frame "${name}" not found in atlas "${actualTextureKey}"`);
        }
      });
    }
  } else {
    console.error(`Texture "${actualTextureKey}" not found. Make sure the atlas is loaded correctly.`);
  }

  group.setDepth(layer.initialDepth || 0);
  // attachAttributes( layer, group)

  return group;
}