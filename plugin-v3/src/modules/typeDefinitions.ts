// src/types/WrappedObject.ts

export interface WrappedObject {
    name: string;
    type: string;
    placed: Phaser.GameObjects.GameObject;
    children?: WrappedObject[];
    remove: (options?: { depth?: number }) => void;
    [key: string]: any; 
}


export interface SpriteData {
    name: string;
    type: 'simple' | 'atlas' | 'spritesheet' | 'animation' | 'merged';
    x: number;
    y: number;
    width: number;
    height: number;
    initialDepth: number;
    filePath?: string;
    children?: SpriteData[];
    atlas?: any;
    frame_width?: number;
    frame_height?: number;
    frame_count?: number;
    columns?: number;
    rows?: number;
    placement?: Array<{
        frame: number | string;
        x: number;
        y: number;
        initialDepth: number;
        instanceName: string;
        [key: string]: any;
    }>;
    [key: string]: any;
}

export interface CameraConfig {
  lazyLoadingOptions?: LazyLoadingOptions;
  draggableOptions?: DraggableOptions;
  debug?: DebugOptions;
}

export interface LazyLoadingOptions {
  active?: boolean;
  extendPreloadBounds?: number;
  transitionStyle?: 'fade' | 'instant';
  debug?: {
    shape?: boolean;
  };
}

export interface DraggableOptions {
  setBounds?: { x: number; y: number; width: number; height: number };
  useBounds?: boolean;
  easeDragging?: boolean;
  easeAmount?: number;
  friction?: number;
  minSpeed?: number;
}

export interface DebugOptions {
  label?: boolean;
  shape?: boolean;
  console?: boolean;
}

export interface PanOptions {
  pointPlacement?: 'center' | 'topLeft' | [number, number];
  speed?: number;
  easing?: boolean;
}
