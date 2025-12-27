// src/modules/cameras/create.ts

import PsdToPhaserPlugin from '../../PsdToPhaser';
import { DraggableCamera } from './features/draggable';
import { LazyLoadCamera } from './features/lazyLoad';

import type { CameraOptions, LazyLoadCameraOptions } from '../../types';

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
