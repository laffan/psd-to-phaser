/**
 * Parallax preset – makes a placed object move at a different speed than
 * the camera scroll, creating a depth/parallax effect.
 *
 * Defaults to the main camera but accepts a specific camera reference
 * or camera name.
 *
 * @module use/functions/parallax
 *
 * @example
 * ```js
 * const psd = this.P2P.place(this, "psd_key", "root");
 * const distant = psd.target("distant");
 *
 * this.P2P.use.parallax({
 *   target: distant,
 *   scrollFactor: 0.25,  // moves at 25% of camera speed
 * });
 * ```
 */

import PsdToPhaserPlugin from '../../../PsdToPhaser';

/** Configuration options for `parallax()`. */
export interface ParallaxOptions {
  /** Camera to track (defaults to `scene.cameras.main`). Accepts a Camera instance or camera name string. */
  camera?: Phaser.Cameras.Scene2D.Camera | string;
  /** The game object to apply the parallax effect to */
  target: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
  /** Scroll factor (0–1). Lower values = slower movement = appears more distant. Default: 0.25 */
  scrollFactor?: number;
}

/**
 * Factory that creates the `parallax()` preset function.
 *
 * Registers a scene `update` handler that adjusts the target's position
 * each frame based on camera scroll and the configured scroll factor.
 *
 * @param _plugin - Plugin instance (unused, reserved)
 * @returns The `parallax()` function
 *
 * @internal
 */
export function parallax(_plugin: PsdToPhaserPlugin) {
  return function (options: ParallaxOptions) {
    const {
      camera: cameraOrName,
      target,
      scrollFactor = 0.25,
    } = options;

    if (!target) {
      console.warn('[P2P parallax] No valid "target" was provided.');
      return;
    }

    let camera: Phaser.Cameras.Scene2D.Camera | undefined;
    let scene: Phaser.Scene | undefined;

    if (typeof cameraOrName === 'string') {
      scene = target.scene;
      if (!scene) {
        console.warn(`[P2P parallax] Could not resolve scene from target for camera "${cameraOrName}".`);
        return;
      }

      camera = scene.cameras.getCamera(cameraOrName) as Phaser.Cameras.Scene2D.Camera;
      if (!camera) {
        camera = scene.cameras.main;
      }

    } else if (cameraOrName instanceof Phaser.Cameras.Scene2D.Camera) {
      camera = cameraOrName;
      scene = camera.scene;

    } else {
      scene = target.scene;
      if (!scene) {
        console.warn('[P2P parallax] Could not find scene from target to use a default camera.');
        return;
      }
      camera = scene.cameras.main;
    }

    if (!camera) {
      console.warn('[P2P parallax] Could not resolve a valid camera.');
      return;
    }
    if (!scene) {
      console.warn('[P2P parallax] Could not resolve a valid scene.');
      return;
    }

    const sysAny = scene.sys as any; // so we can attach custom property
    if (!sysAny._parallaxItems) {
      sysAny._parallaxItems = [];

      scene.events.on('update', () => {
        const items = sysAny._parallaxItems || [];
        for (const item of items) {
          // Adjust position based on camera scroll
          item.target.x = item.initX + item.camera.scrollX * item.factor;
          item.target.y = item.initY + item.camera.scrollY * item.factor;
        }
      });
    }

    sysAny._parallaxItems.push({
      target,
      camera,
      factor: scrollFactor,
      initX: target.x,
      initY: target.y,
    });
  };
}