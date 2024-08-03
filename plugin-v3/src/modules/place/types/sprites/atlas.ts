import PsdToPhaserPlugin from '../../../../PsdToPhaserPlugin';

export function placeAtlas(
  scene: Phaser.Scene,
  sprite: any,
  plugin: PsdToPhaserPlugin,
  psdKey: string
): Phaser.GameObjects.Group {
  const group = scene.add.group();
  group.name = sprite.name;

  if (scene.textures.exists(sprite.name)) {
    const texture = scene.textures.get(sprite.name);
    const frames = texture.getFrameNames();

    if (sprite.instances && Array.isArray(sprite.instances)) {
      sprite.instances.forEach((instance: any) => {
        const { name, x, y } = instance;
        if (frames.includes(name)) {
          const spriteObject = scene.add.sprite(x, y, sprite.name, name);
          spriteObject.setName(name);
          spriteObject.setOrigin(0, 0);
          group.add(spriteObject);
          spriteObject.setDepth(sprite.initialDepth || 0);

          // Debug: Log the frame size
          const frame = spriteObject.frame;
          console.log(`Placed frame "${name}" at (${x}, ${y}) with size: ${frame.width}x${frame.height}`);
        } else {
          console.warn(`Frame "${name}" not found in atlas "${sprite.name}"`);
        }
      });
    }
  } else {
    console.error(`Texture "${sprite.name}" not found. Make sure the atlas is loaded correctly.`);
  }

  group.setDepth(sprite.initialDepth || 0);

  return group;
}