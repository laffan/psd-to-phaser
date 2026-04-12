/**
 * Camera factory – creates enhanced cameras with composable features.
 *
 * Available features:
 * - `"draggable"` – click-and-drag panning with optional easing
 * - `"lazyLoad"` – loads assets on demand as they enter the viewport
 *
 * Features can be combined:
 * ```js
 * this.P2P.createCamera(this.cameras.main, ['lazyLoad', 'draggable'], { ... });
 * ```
 *
 * @module cameras/create
 */

import PsdToPhaserPlugin from '../../PsdToPhaser';
import { DraggableCamera } from './features/draggable';
import { LazyLoadCamera } from './features/lazyLoad';

import type { CameraOptions, LazyLoadCameraOptions } from '../../types';

/**
 * Create an enhanced camera by composing one or more features onto it.
 *
 * Each requested feature's methods and state are mixed into the camera
 * object via `Object.assign`, so the returned camera has all standard
 * Phaser camera methods plus any feature-specific ones (e.g. `pause()`,
 * `resume()`, `isPaused()` from draggable).
 *
 * @param plugin - Plugin instance
 * @param camera - The Phaser camera to enhance (usually `this.cameras.main`)
 * @param features - Array of feature names to apply
 * @param options - Feature-specific configuration
 * @returns The enhanced camera object
 *
 * @example
 * ```js
 * // Draggable camera with easing
 * this.P2P.createCamera(this.cameras.main, ['draggable'], {
 *   draggable: { easeDragging: true, friction: 0.95 }
 * });
 *
 * // Lazy-load camera targeting specific PSDs
 * this.P2P.createCamera(this.cameras.main, ['lazyLoad'], {
 *   lazyLoad: { targetKeys: ["bg_psd"], checkInterval: 300 }
 * });
 * ```
 */
export function createCamera(
  plugin: PsdToPhaserPlugin,
  camera: Phaser.Cameras.Scene2D.Camera,
  features: string[],
  options: CameraOptions = {}
): Phaser.Cameras.Scene2D.Camera {
  const enhancedCamera = camera as Phaser.Cameras.Scene2D.Camera & Record<string, unknown>;

  if (features.includes('draggable')) {
    Object.assign(enhancedCamera, DraggableCamera(plugin, camera, options.draggable));
  }

  if (features.includes('lazyLoad')) {
    const lazyLoadOptions: LazyLoadCameraOptions =
      typeof options.lazyLoad === 'boolean' ? {} : options.lazyLoad ?? {};

    Object.assign(enhancedCamera, LazyLoadCamera(plugin, camera, lazyLoadOptions));
  }

  return enhancedCamera;
}
