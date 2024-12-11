import PsdToPhaserPlugin from '../../../PsdToPhaserPlugin';

interface FillZoneOptions {
  useFrames?: number[] | string[];
  scaleRange?: [number, number];
  tint?: number[];
  minInstances?: number;
  maxInstances?: number;
}

export function fillZone(_plugin: PsdToPhaserPlugin) {
  return function(
    zone: Phaser.GameObjects.Zone,
    sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Group,
    options: FillZoneOptions = {}
  ) {
    const scene = zone.scene;
    
    if (!scene) {
      console.error('Unable to determine scene for fillZone');
      return;
    }

    const points = zone.getData('points') as Phaser.Geom.Point[];
    if (!points || points.length === 0) {
      console.error('Zone does not have valid points data');
      return;
    }

    const polygon = new Phaser.Geom.Polygon(points);
    const bounds = Phaser.Geom.Polygon.GetAABB(polygon);

    let spriteKey: string;
    let frames: (number | string)[];

    if (sprite instanceof Phaser.GameObjects.Group) {
      // If it's a group, use the first child's texture
      const firstChild = sprite.getChildren()[0] as Phaser.GameObjects.Sprite;
      if (!firstChild) {
        console.error('Group is empty');
        return;
      }
      spriteKey = firstChild.texture.key;
      frames = options.useFrames || [firstChild.frame.name];
    } else {
      spriteKey = sprite.texture.key;
      frames = options.useFrames || [sprite.frame.name];
    }

    const texture = scene.textures.get(spriteKey);
    if (!texture) {
      console.error(`Texture not found: ${spriteKey}`);
      return;
    }

    if (!frames || frames.length === 0) {
      const frameNames = texture.getFrameNames();
      if (frameNames.length > 0) {
        // It's an atlas or spritesheet with named frames
        frames = frameNames;
      } else {
        // It's a spritesheet with numbered frames
        frames = Array.from({length: texture.frameTotal}, (_, i) => i);
      }
    }

    const group = scene.add.group();

    const minInstances = options.minInstances !== undefined ? options.minInstances : 5;
    const maxInstances = options.maxInstances !== undefined ? options.maxInstances : 10;

    const targetInstances = Phaser.Math.Between(minInstances, maxInstances);

    let spritesPlaced = 0;
    let maxAttempts = targetInstances * 10; // Safeguard against infinite loops
    let attempts = 0;

    while (spritesPlaced < targetInstances && attempts < maxAttempts) {
      const x = Phaser.Math.Between(bounds.left, bounds.right);
      const y = Phaser.Math.Between(bounds.top, bounds.bottom);

      if (Phaser.Geom.Polygon.Contains(polygon, x, y)) {
        const frame = Phaser.Math.RND.pick(frames);
        const fillerSprite = scene.add.sprite(x, y, spriteKey, frame);

        if (options.scaleRange) {
          const scale = Phaser.Math.FloatBetween(options.scaleRange[0], options.scaleRange[1]);
          fillerSprite.setScale(scale);
        }

        if (options.tint && options.tint.length > 0) {
          const tint = Phaser.Math.RND.pick(options.tint);
          fillerSprite.setTint(tint);
        }

        group.add(fillerSprite);
        spritesPlaced++;
      }

      attempts++;
    }

    console.log(`fillZone completed. Sprites placed: ${spritesPlaced}, Target: ${targetInstances}, Attempts: ${attempts}`);

    return group;
  };
}