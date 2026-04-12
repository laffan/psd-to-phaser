/**
 * FillZone preset – randomly fills a zone with sprite instances.
 *
 * Works with any placed zone and any loaded sprite, spritesheet, or atlas.
 * Sprites are placed only within the zone's polygon boundary.
 *
 * @module use/functions/fillZone
 *
 * @example
 * ```js
 * this.P2P.use.fillZone(myZone, mySprite);
 *
 * this.P2P.use.fillZone(myZone, mySpritesheet, {
 *   useFrames: [1, 3],
 *   scaleRange: [0.8, 1.1],
 *   tint: [0x15ae15, 0xdaaf3a],
 *   minInstances: 5,
 *   maxInstances: 10,
 * });
 * ```
 */

import PsdToPhaserPlugin from '../../../PsdToPhaser';

/** Configuration options for `fillZone()`. */
interface FillZoneOptions {
  /** Specific frames to use from a spritesheet or atlas */
  useFrames?: number[] | string[];
  /** Random scale range `[min, max]` applied to each placed sprite */
  scaleRange?: [number, number];
  /** Array of tint colours randomly applied to placed sprites */
  tint?: number[];
  /** Minimum number of sprites to place (default: 5) */
  minInstances?: number;
  /** Maximum number of sprites to place (default: 10) */
  maxInstances?: number;
}

/**
 * Factory that creates the `fillZone()` preset function.
 *
 * @param _plugin - Plugin instance (unused, reserved)
 * @returns The `fillZone()` function
 *
 * @internal
 */
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

    const points = zone.getData('points') as Phaser.Math.Vector2[];
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