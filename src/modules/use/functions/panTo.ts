/**
 * PanTo preset – smoothly pans a camera to a target position or game object.
 *
 * Emits the following events on the scene:
 * - `"panToStart"` – pan begins
 * - `"panToProgress"` – pan in progress (with completion ratio)
 * - `"panToComplete"` – pan finished
 *
 * @module use/functions/panTo
 *
 * @example
 * ```js
 * this.P2P.use.panTo(this.cameras.main, placedPoint, {
 *   targetPositionY: "center",
 *   targetPositionX: "center",
 *   targetOffset: [300, 100],
 *   speed: 300,
 *   easing: true,
 * });
 *
 * this.events.on("panToComplete", () => console.log("Done!"));
 * ```
 */

import PsdToPhaserPlugin from '../../../PsdToPhaser';

/** Configuration options for `panTo()`. */
export interface PanToOptions {
  /** Vertical alignment of the target in the viewport */
  targetPositionY?: 'center' | 'top' | 'bottom';
  /** Horizontal alignment of the target in the viewport */
  targetPositionX?: 'center' | 'left' | 'right';
  /** Pixel offset `[x, y]` applied after alignment */
  targetOffset?: [number, number];
  /** Duration of the pan animation in milliseconds (default: 300) */
  speed?: number;
  /** Enable cubic ease-in-out (default: true) */
  easing?: boolean;
}

/**
 * Factory that creates the `panTo()` preset function.
 *
 * @param _plugin - Plugin instance (unused, reserved)
 * @returns The `panTo()` function
 *
 * @internal
 */
export function panTo(_plugin: PsdToPhaserPlugin) {
  return function(camera: Phaser.Cameras.Scene2D.Camera, target: Phaser.GameObjects.GameObject | [number, number], options: PanToOptions = {}) {
    const scene = camera.scene;
    const defaults: PanToOptions = {
      targetPositionY: 'center',
      targetPositionX: 'center',
      targetOffset: [0, 0],
      speed: 300,
      easing: true
    };

    const config = { ...defaults, ...options };

    let targetX: number, targetY: number;
    let targetWidth: number = 0, targetHeight: number = 0;

    if (Array.isArray(target)) {
      [targetX, targetY] = target;
    } else {
      targetX = (target as any).x;
      targetY = (target as any).y;
      targetWidth = (target as any).width || 0;
      targetHeight = (target as any).height || 0;
    }

    // Calculate the center point of the target
    targetX += targetWidth / 2;
    targetY += targetHeight / 2;

    // Apply target position adjustments
    switch (config.targetPositionX) {
      case 'left':
        targetX += camera.width / 2;
        break;
      case 'right':
        targetX -= camera.width / 2;
        break;
      case 'center':
      default:
        // No adjustment needed for center
        break;
    }

    switch (config.targetPositionY) {
      case 'top':
        targetY += camera.height / 2;
        break;
      case 'bottom':
        targetY -= camera.height / 2;
        break;
      case 'center':
      default:
        // No adjustment needed for center
        break;
    }

    // Apply offset
    targetX += config.targetOffset![0];
    targetY += config.targetOffset![1];

    // Calculate the final scroll position
    const scrollX = targetX - camera.width / 2;
    const scrollY = targetY - camera.height / 2;

    // Calculate the distance to pan
    const distanceX = scrollX - camera.scrollX;
    // const distanceY = scrollY - camera.scrollY;
    // const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    // Set up the pan animation
    const duration = config.speed!;
    let easingFunction = Phaser.Math.Easing.Linear;

    if (config.easing === true) {
      easingFunction = Phaser.Math.Easing.Cubic.InOut;
    } else if (typeof config.easing === 'function') {
      easingFunction = config.easing;
    }

    scene.events.emit('panToStart');

    scene.tweens.add({
      targets: camera,
      scrollX: scrollX,
      scrollY: scrollY,
      duration: duration,
      ease: easingFunction,
      onUpdate: () => {
        const progress = 1 - (camera.scrollX - scrollX) / distanceX;
        scene.events.emit('panToProgress', progress);
      },
      onComplete: () => {
        scene.events.emit('panToComplete');
      }
    });
  };
}