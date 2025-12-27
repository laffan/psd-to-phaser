/**
 * Central type definitions for psd-to-phaser
 *
 * This module re-exports all types for convenient importing:
 *
 * @example
 * import type { PsdLayer, SpriteLayer, ProcessedPsdData } from '../types';
 * import { isSpriteLayer, isGroupLayer } from '../types';
 */

// PSD layer types
export type {
  LayerCategory,
  SpriteType,
  AnimationAttributes,
  LayerAttributes,
  BaseLayer,
  FrameData,
  SpriteInstance,
  DefaultSpriteLayer,
  AtlasSpriteLayer,
  SpritesheetLayer,
  AnimationSpriteLayer,
  SpriteLayer,
  TilesetLayer,
  ZoneBoundingBox,
  ZoneLayer,
  PointLayer,
  GroupLayer,
  PsdLayer,
  PsdDocument,
  TileLoadData,
  TilePlacementData,
  LazyLoadTileData,
} from './psd';

// Type guards
export {
  isSpriteLayer,
  isTilesetLayer,
  isZoneLayer,
  isPointLayer,
  isGroupLayer,
  isAtlasSprite,
  isSpritesheetSprite,
  isAnimationSprite,
  isDefaultSprite,
  hasMask,
} from './psd';

// Plugin types
export type {
  DebugOptions,
  PluginOptions,
  LoadOptions,
  CategorizedLayers,
  ProcessedPsdData,
  PlaceOptions,
  DraggableOptions,
  LazyLoadCameraOptions,
  CameraOptions,
  MultiplePsdConfig,
  AtlasFrameData,
  AtlasJsonData,
} from './plugin';
