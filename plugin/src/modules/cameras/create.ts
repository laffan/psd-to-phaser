// src/modules/cameras/create.ts

import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';
import { DraggableCamera, DraggableOptions } from './features/draggable';
import { LazyLoadCamera, LazyLoadOptions } from './features/lazyLoad';

export interface CameraOptions {
  draggable?: DraggableOptions;
  lazyLoad?: boolean | LazyLoadOptions;
}

export function createCamera(plugin: PsdToPhaserPlugin, camera: Phaser.Cameras.Scene2D.Camera, features: string[], options: CameraOptions = {}) {
  const enhancedCamera: any = camera;

  if (features.includes('draggable')) {
    Object.assign(enhancedCamera, DraggableCamera(plugin, camera, options.draggable));
  }

  if (features.includes('lazyLoad')) {
    // Convert boolean to LazyLoadOptions, using empty object as default
    const lazyLoadOptions: LazyLoadOptions = typeof options.lazyLoad === 'boolean' 
      ? options.lazyLoad ? {} : {} 
      : options.lazyLoad || {};
      
    Object.assign(enhancedCamera, LazyLoadCamera(plugin, camera, lazyLoadOptions));
  }

  return enhancedCamera;
}

  

