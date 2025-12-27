/**
 * Plugin configuration and processed data type definitions
 */

import type {
  PsdDocument,
  SpriteLayer,
  TilesetLayer,
  ZoneLayer,
  PointLayer,
  GroupLayer,
} from './psd';

// =============================================================================
// Debug Options
// =============================================================================

export interface DebugOptions {
  shape?: boolean;
  label?: boolean;
  console?: boolean;
}

// =============================================================================
// Plugin Options
// =============================================================================

export interface PluginOptions {
  debug?: boolean | DebugOptions;
  applyAlphaAll?: boolean;
  applyBlendModesAll?: boolean;
}

// =============================================================================
// Load Options
// =============================================================================

export interface LoadOptions {
  lazyLoad?: boolean | string[];
}

// =============================================================================
// Categorized Layer Collections
// =============================================================================

export interface CategorizedLayers {
  sprites: SpriteLayer[];
  tiles: TilesetLayer[];
  zones: ZoneLayer[];
  points: PointLayer[];
  groups: GroupLayer[];
}

// =============================================================================
// Processed PSD Data (stored in plugin)
// =============================================================================

export interface ProcessedPsdData {
  /** Clone of original PSD document data */
  original: PsdDocument;
  /** Base path to PSD assets folder */
  basePath: string;
  /** Layers to load immediately */
  initialLoad: CategorizedLayers;
  /** Layers marked for lazy loading */
  lazyLoad: CategorizedLayers;
  /** Position offset (only for loadMultiple) */
  positionOffset?: { x: number; y: number };
  /** Flag indicating if loaded via loadMultiple */
  isMultiplePsd?: boolean;
}

// =============================================================================
// Place Options
// =============================================================================

export interface PlaceOptions {
  /** Limit recursion depth when placing groups */
  depth?: number;
  /** Override animation options when placing animated sprites */
  animationOptions?: Phaser.Types.Animations.Animation;
}

// =============================================================================
// Camera Options
// =============================================================================

export interface DraggableOptions {
  useBounds?: { x: number; y: number; width: number; height: number };
  easeDragging?: boolean;
  friction?: number;
  minSpeed?: number;
  ignore?: string[];
}

export interface LazyLoadCameraOptions {
  /** Specific PSD keys to target, defaults to all PSDs */
  targetKeys?: string[];
  /** Extend/contract trigger bounds beyond camera */
  extendPreloadBounds?: number;
  /** Milliseconds between visibility checks */
  checkInterval?: number;
  /** Create invisible camera unaffected by zoom for boundary calculations */
  createBoundaryCamera?: boolean;
  /** Debug visualization options */
  debug?: DebugOptions;
}

export interface CameraOptions {
  draggable?: DraggableOptions;
  lazyLoad?: boolean | LazyLoadCameraOptions;
}

// =============================================================================
// Multiple PSD Config
// =============================================================================

export interface MultiplePsdConfig {
  key: string;
  path: string;
  position: { x: number; y: number };
  lazyLoad?: boolean | string[];
}

// =============================================================================
// Atlas Data Structures (for Phaser loading)
// =============================================================================

export interface AtlasFrameData {
  frame: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  rotated: boolean;
  trimmed: boolean;
  sourceSize: {
    w: number;
    h: number;
  };
  spriteSourceSize: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface AtlasJsonData {
  frames: Record<string, AtlasFrameData>;
}
