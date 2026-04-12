/**
 * Plugin configuration and processed data type definitions.
 *
 * These types define the plugin's initialisation options, the structure of
 * processed PSD data stored internally, and configuration for camera features.
 *
 * @module types/plugin
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

/**
 * Granular debug visualisation channels.
 *
 * - `shape` – draw outlines around placed items
 * - `label` – show text labels with layer names
 * - `console` – log placement and loading info to the browser console
 */
export interface DebugOptions {
  /** Draw outline shapes around placed layers */
  shape?: boolean;
  /** Show text labels above placed layers */
  label?: boolean;
  /** Log progress and placement info to the console */
  console?: boolean;
}

// =============================================================================
// Plugin Options
// =============================================================================

/**
 * Top-level plugin options passed via the `data` field when registering the
 * plugin, or directly to `init()`.
 *
 * @example
 * ```js
 * data: {
 *   debug: { shape: false, label: false, console: true },
 *   applyAlphaAll: false,
 *   applyBlendModesAll: false,
 * }
 * ```
 */
export interface PluginOptions {
  /** Enable debug visualisation. `true` enables all channels; an object selects individual ones. */
  debug?: boolean | DebugOptions;
  /** Apply PSD alpha values to all placed items by default */
  applyAlphaAll?: boolean;
  /** Apply PSD blend modes to all placed items by default */
  applyBlendModesAll?: boolean;
}

// =============================================================================
// Load Options
// =============================================================================

/**
 * Options for the `load()` call.
 */
export interface LoadOptions {
  /**
   * Control lazy loading.
   * - `true` – mark ALL layers for lazy loading
   * - `string[]` – mark only layers with these names for lazy loading
   * - `undefined` / omitted – respect per-layer `lazyLoad` attributes from the PSD
   */
  lazyLoad?: boolean | string[];
}

// =============================================================================
// Categorized Layer Collections
// =============================================================================

/** Layers split by category after JSON processing. Used for both initial and lazy-load buckets. */
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

/**
 * Options for the draggable camera feature.
 *
 * @see {@link DraggableCamera}
 */
export interface DraggableOptions {
  /** Rectangular bounds to constrain camera scrolling */
  useBounds?: { x: number; y: number; width: number; height: number };
  /** Enable momentum/inertia after releasing the drag */
  easeDragging?: boolean;
  /** Friction factor (0–1) applied to velocity when easing */
  friction?: number;
  /** Velocity threshold below which easing stops */
  minSpeed?: number;
  /** Paths of interactive objects to ignore when starting a drag */
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

/**
 * Combined options object for `createCamera()`.
 * Each key configures its corresponding feature.
 */
export interface CameraOptions {
  /** Configuration for the draggable camera feature */
  draggable?: DraggableOptions;
  /** Configuration for the lazy-load camera feature. `true` uses defaults. */
  lazyLoad?: boolean | LazyLoadCameraOptions;
}

// =============================================================================
// Multiple PSD Config
// =============================================================================

/**
 * Configuration for a single PSD within a `loadMultiple()` call.
 */
export interface MultiplePsdConfig {
  /** Unique identifier for this PSD */
  key: string;
  /** Path to the PSD assets folder (contains `data.json`) */
  path: string;
  /** World-space offset applied to every layer's position */
  position: { x: number; y: number };
  /** Mark all (`true`) or specific layers for lazy loading */
  lazyLoad?: boolean | string[];
}

// =============================================================================
// Atlas Data Structures (for Phaser loading)
// =============================================================================

/** Phaser-compatible atlas frame data structure. */
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

/** Complete atlas JSON structure passed to `scene.load.atlas()`. */
export interface AtlasJsonData {
  frames: Record<string, AtlasFrameData>;
}
