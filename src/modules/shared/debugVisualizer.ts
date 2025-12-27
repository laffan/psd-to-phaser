// src/modules/shared/debugVisualizer.ts

import PsdToPhaserPlugin from '../../PsdToPhaser';

/**
 * Debug colors for different layer types
 */
export const DEBUG_COLORS = {
  sprite: 0x00ff00,   // Green
  tileset: 0xff0000,  // Red
  zone: 0x0000ff,     // Blue
  point: 0xff0000,    // Red
  group: 0xffff00,    // Yellow
} as const;

export type DebugLayerType = keyof typeof DEBUG_COLORS;

const DEBUG_DEPTH = 1000;

/**
 * Options for debug visualization
 */
export interface DebugVisualizationOptions {
  /** Layer type determines color and shape style */
  type: DebugLayerType;
  /** Layer name for the label */
  name: string;
  /** X position */
  x: number;
  /** Y position */
  y: number;
  /** Width (for rectangles) */
  width?: number;
  /** Height (for rectangles) */
  height?: number;
  /** For zones: polygon points or rectangle from subpaths */
  zoneShape?: Phaser.Geom.Polygon | Phaser.Geom.Rectangle;
}

/**
 * Result containing created debug objects
 */
export interface DebugVisualizationResult {
  shape: Phaser.GameObjects.Graphics | Phaser.GameObjects.Arc | null;
  label: Phaser.GameObjects.Text | null;
}

/**
 * Add debug visualization for a layer.
 *
 * This is the consolidated debug visualization function that replaces
 * duplicated addDebugVisualization functions across placement modules.
 *
 * @param scene - The Phaser scene
 * @param plugin - The PsdToPhaser plugin (for debug settings)
 * @param group - The group to add debug objects to
 * @param options - Visualization options
 * @returns The created debug objects
 */
export function addDebugVisualization(
  scene: Phaser.Scene,
  plugin: PsdToPhaserPlugin,
  group: Phaser.GameObjects.Group,
  options: DebugVisualizationOptions
): DebugVisualizationResult {
  const result: DebugVisualizationResult = {
    shape: null,
    label: null,
  };

  const color = DEBUG_COLORS[options.type];
  const colorHex = `#${color.toString(16).padStart(6, '0')}`;

  // Add shape visualization
  if (plugin.isDebugEnabled('shape')) {
    result.shape = createDebugShape(scene, options, color);
    if (result.shape) {
      result.shape.setDepth(DEBUG_DEPTH);
      (result.shape as any).isDebugObject = true;
      group.add(result.shape);
    }
  }

  // Add label visualization
  if (plugin.isDebugEnabled('label')) {
    result.label = createDebugLabel(scene, options, colorHex);
    if (result.label) {
      result.label.setDepth(DEBUG_DEPTH);
      (result.label as any).isDebugObject = true;
      group.add(result.label);
    }
  }

  return result;
}

/**
 * Create the debug shape based on layer type
 */
function createDebugShape(
  scene: Phaser.Scene,
  options: DebugVisualizationOptions,
  color: number
): Phaser.GameObjects.Graphics | Phaser.GameObjects.Arc | null {
  switch (options.type) {
    case 'point':
      // Points use a filled circle
      const circle = scene.add.circle(options.x, options.y, 5, color);
      circle.setStrokeStyle(2, color);
      return circle;

    case 'zone':
      // Zones use polygon or rectangle from shape
      if (options.zoneShape) {
        const graphics = scene.add.graphics();
        graphics.lineStyle(2, color, 1);

        if (options.zoneShape instanceof Phaser.Geom.Polygon) {
          graphics.strokePoints(options.zoneShape.points, true);
        } else {
          graphics.strokeRect(
            options.zoneShape.x,
            options.zoneShape.y,
            options.zoneShape.width,
            options.zoneShape.height
          );
        }
        return graphics;
      }
      return null;

    case 'sprite':
    case 'tileset':
    case 'group':
    default:
      // Sprites, tilesets, and groups use rectangles
      if (options.width !== undefined && options.height !== undefined) {
        const graphics = scene.add.graphics();
        graphics.lineStyle(2, color, 1);
        graphics.strokeRect(options.x, options.y, options.width, options.height);
        return graphics;
      }
      return null;
  }
}

/**
 * Create the debug label based on layer type
 */
function createDebugLabel(
  scene: Phaser.Scene,
  options: DebugVisualizationOptions,
  colorHex: string
): Phaser.GameObjects.Text {
  const textStyle = {
    fontSize: '16px',
    color: colorHex,
    backgroundColor: '#ffffff',
  };

  let x = options.x;
  let y = options.y - 20;
  let originX = 0;
  let originY = 0;

  // Special positioning for different types
  switch (options.type) {
    case 'point':
      // Points have label centered above
      originX = 0.5;
      originY = 1;
      break;

    case 'zone':
      // Zones have label at center of shape
      if (options.zoneShape) {
        if (options.zoneShape instanceof Phaser.Geom.Polygon) {
          const bounds = Phaser.Geom.Polygon.GetAABB(options.zoneShape);
          x = bounds.centerX;
          y = bounds.centerY;
        } else {
          x = options.zoneShape.centerX;
          y = options.zoneShape.centerY;
        }
        originX = 0.5;
        originY = 0.5;
      }
      break;

    // Sprites, tilesets, and groups use default positioning (above top-left)
  }

  const text = scene.add.text(x, y, options.name, textStyle);
  text.setOrigin(originX, originY);
  return text;
}

/**
 * Helper to get center of a zone shape
 */
export function getZoneShapeCenter(
  shape: Phaser.Geom.Polygon | Phaser.Geom.Rectangle
): { x: number; y: number } {
  if (shape instanceof Phaser.Geom.Polygon) {
    const bounds = Phaser.Geom.Polygon.GetAABB(shape);
    return { x: bounds.centerX, y: bounds.centerY };
  }
  return { x: shape.centerX, y: shape.centerY };
}
