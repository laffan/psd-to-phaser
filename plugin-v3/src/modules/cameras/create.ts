// src/modules/cameras/create.ts

import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';
import { DraggableCamera, DraggableOptions } from './features/draggable';
import { LazyLoadCamera } from './features/lazyLoad';
import { panTo } from './functions/panTo';

export interface CameraOptions {
  draggable?: DraggableOptions;
  lazyLoad?: boolean;
  overlay?: boolean;
}

export function createCamera(plugin: PsdToPhaserPlugin, camera: Phaser.Cameras.Scene2D.Camera, features: string[], psdKey: string, options: CameraOptions = {}) {
  const enhancedCamera: any = camera;

  if (features.includes('draggable')) {
    Object.assign(enhancedCamera, DraggableCamera(plugin, camera, options.draggable));
  }

  if (features.includes('lazyLoad')) {
  Object.assign(enhancedCamera, LazyLoadCamera(plugin, camera, psdKey, options.lazyLoad));
  }
  
  enhancedCamera.panTo = panTo(plugin, camera);


  return enhancedCamera;
}