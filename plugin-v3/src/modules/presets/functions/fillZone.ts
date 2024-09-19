import PsdToPhaserPlugin from '../../../PsdToPhaserPlugin';

interface FillZoneOptions {
  useFrames?: number[];
  scaleRange?: [number, number];
  tint?: number[];
  minInstances?: number;
  maxInstances?: number;
}

export function fillZone(plugin: PsdToPhaserPlugin) {
  return function(
    zone: Phaser.GameObjects.Zone,
    sprite: Phaser.GameObjects.Sprite | Phaser.Textures.Texture,
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

    const texture = (sprite instanceof Phaser.GameObjects.Sprite) ? sprite.texture : sprite;
    const frames = options.useFrames || (texture.frameTotal > 1 ? Array.from({length: texture.frameTotal}, (_, i) => i) : [0]);

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
        const fillerSprite = scene.add.sprite(x, y, texture, frame);

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