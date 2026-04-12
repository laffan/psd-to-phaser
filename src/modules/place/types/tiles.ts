/**
 * Tileset layer placement – renders pre-sliced tile grids inside Phaser Containers.
 *
 * Each tileset in the PSD is represented as a grid of image slices generated
 * by psd-to-json. This module places them into a Container that preserves
 * the original position and supports lazy loading, masks, and method overrides
 * so that operations like `setAlpha()` propagate to every child tile.
 *
 * @module place/types/tiles
 */

import PsdToPhaserPlugin from "../../../PsdToPhaser";
import {
  checkIfLazyLoaded,
  createLazyLoadPlaceholder,
} from "../../shared/lazyLoadUtils";
import { attachAttributes } from "../../shared/attachAttributes";
import { applyMaskToContainer } from "../../shared/applyMask";
import { addDebugVisualization } from "../../shared/debugVisualizer";

import type { TilesetLayer, TilePlacementData } from "../../../types";

/**
 * Place a tileset layer into the scene.
 *
 * Creates a Container at the tileset's position, populates it with tile
 * images (or lazy-load placeholders), applies masks, and overrides
 * container methods so operations propagate to child tiles.
 *
 * @param scene - The Phaser scene
 * @param layer - Tileset layer definition
 * @param plugin - Plugin instance
 * @param tileSliceSize - Pixel size of each tile slice
 * @param group - Parent group to add the tile container to
 * @param resolve - Callback to signal placement is complete
 * @param psdKey - PSD key for namespace resolution
 *
 * @internal
 */
export function placeTiles(
  scene: Phaser.Scene,
  layer: TilesetLayer,
  plugin: PsdToPhaserPlugin,
  tileSliceSize: number,
  group: Phaser.GameObjects.Group,
  resolve: () => void,
  psdKey: string
): void {
  const tileContainer = scene.add.container(layer.x, layer.y);
  tileContainer.setName(layer.name);

  // Store the original tile data for lazy loading
  tileContainer.setData("tileData", layer);
  tileContainer.setData("tileSliceSize", tileSliceSize);
  tileContainer.setData("psdKey", psdKey);
  tileContainer.setDepth(layer.initialDepth ?? 0);
  attachAttributes(layer, tileContainer);
  

  const methodsToOverride = [
    "setX",
    "setY",
    "setPosition",
    "setBlendMode",
    "setAlpha",
    "setDepth",
  ];

  methodsToOverride.forEach((method) => {
    overrideContainerMethod(tileContainer, method);
  });

  const isLazyLoaded = checkIfLazyLoaded(plugin, psdKey, layer);

  if (isLazyLoaded) {
    const placeholder = createLazyLoadPlaceholder(scene, layer, plugin);
    if (placeholder) tileContainer.add(placeholder);
  } else {
    // Check if this PSD was loaded via loadMultiple for tile key namespacing
    const pluginData = plugin.getData(psdKey);
    const useNamespacedKeys = pluginData?.isMultiplePsd || false;
    placeTilesInContainer(scene, tileContainer, layer, tileSliceSize, useNamespacedKeys, psdKey);
  }

  // Apply bitmap mask to the tile container if layer has one
  applyMaskToContainer(scene, layer, tileContainer);

  group.add(tileContainer);

  // Create a separate debug group
  const debugGroup = scene.add.group();
  addDebugVisualization(scene, plugin, debugGroup, {
    type: 'tileset',
    name: layer.name,
    x: layer.x,
    y: layer.y,
    width: layer.columns * tileSliceSize,
    height: layer.rows * tileSliceSize,
  });
  // Add the debug group as a child of the main group, but don't include it in the group's children array
  (group as any).debugGroup = debugGroup;

  resolve();
}

/**
 * Populate a container with tile images for every column/row in a tileset.
 *
 * @param scene - The Phaser scene
 * @param container - Target container to fill
 * @param layer - Tileset layer definition
 * @param tileSliceSize - Pixel size of each tile slice
 * @param useNamespacedKeys - Whether to prefix texture keys with the PSD key
 * @param psdKey - PSD key (used when `useNamespacedKeys` is true)
 *
 * @internal
 */
export function placeTilesInContainer(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  layer: TilesetLayer,
  tileSliceSize: number,
  useNamespacedKeys: boolean = false,
  psdKey?: string
): void {
  for (let col = 0; col < layer.columns; col++) {
    for (let row = 0; row < layer.rows; row++) {
      const x = col * tileSliceSize;
      const y = row * tileSliceSize;
      const tilesetName = useNamespacedKeys && psdKey ? `${psdKey}_${layer.name}` : layer.name;
      const key = `${tilesetName}_tile_${col}_${row}`;

      const tile = placeSingleTile(
        scene,
        {
          x,
          y,
          key,
          initialDepth: layer.initialDepth,
          tilesetName,
          col,
          row,
        },
        container
      );

      if (tile) {
        container.add(tile);
      }
    }
  }
}

/**
 * Override a Container method so it propagates to all child tiles.
 *
 * Position methods (`setX`, `setY`, `setPosition`) apply deltas to children.
 * Other methods (e.g. `setAlpha`, `setBlendMode`) are forwarded directly.
 * Every call is also recorded in `pendingMethodCalls` data so lazy-loaded
 * tiles can replay them when they arrive.
 *
 * @internal
 */
function overrideContainerMethod(
  container: Phaser.GameObjects.Container,
  method: string
): void {
  const originalMethod = (Phaser.GameObjects.Container.prototype as any)[
    method
  ];
  (container as any)[method] = function (...args: any[]) {
    const result = originalMethod.apply(this, args);

    // Special handling for position-related methods
    if (["setX", "setY", "setPosition"].includes(method)) {
      const deltaX =
        method === "setX" || method === "setPosition" ? args[0] - this.x : 0;
      const deltaY =
        method === "setY"
          ? args[0] - this.y
          : method === "setPosition"
          ? args[1] - this.y
          : 0;

      this.each(
        (child: Phaser.GameObjects.GameObject & { x: number; y: number }) => {
          if (deltaX !== 0) child.x += deltaX;
          if (deltaY !== 0) child.y += deltaY;
        }
      );
    } else {
      // For non-position methods, simply apply the method to all children
      this.each((child: Phaser.GameObjects.GameObject) => {
        if (typeof (child as any)[method] === "function") {
          (child as any)[method](...args);
        }
      });
    }

    // Store the method call for lazy loading
    const methodCalls = this.getData("pendingMethodCalls") || [];
    methodCalls.push({ method, args });
    this.setData("pendingMethodCalls", methodCalls);

    return result;
  };
}

/**
 * Place a single tile image at a given position within a container or group.
 *
 * @param scene - The Phaser scene
 * @param tileData - Tile placement data (position, texture key, grid coords)
 * @param parent - Container or Group to add the tile image to
 * @returns The created Image, or `null` if the texture was not found
 *
 * @internal
 */
export function placeSingleTile(
  scene: Phaser.Scene,
  tileData: TilePlacementData,
  parent: Phaser.GameObjects.Container | Phaser.GameObjects.Group
): Phaser.GameObjects.Image | null {
  if (scene.textures.exists(tileData.key)) {
    const tile = scene.add.image(tileData.x, tileData.y, tileData.key);
    tile.setOrigin(0, 0);
    if (parent instanceof Phaser.GameObjects.Group) {
      parent.add(tile);
    } else if (parent instanceof Phaser.GameObjects.Container) {
      parent.add(tile);
    }
    // console.log(
    //   `Placed tile: ${tileData.key} at (${tileData.x}, ${tileData.y})`
    // );
    return tile;
  } else {
    console.warn(`Texture not found for tile: ${tileData.key}`);
    return null;
  }
}

/** A recorded method call to replay on newly loaded tiles. */
interface PendingMethodCall {
  method: string;
  args: any[];
}

/**
 * Replay all recorded method calls on a tile container.
 * Used after lazy-loaded tiles arrive to bring them up to date with
 * any `setAlpha()`, `setBlendMode()`, etc. calls made before they loaded.
 *
 * @internal
 */
export function applyPendingMethodCalls(container: Phaser.GameObjects.Container): void {
  const pendingMethodCalls = container.getData("pendingMethodCalls") || [];
  pendingMethodCalls.forEach(({ method, args }: PendingMethodCall) => {
    if (typeof (container as any)[method] === "function") {
      (container as any)[method](...args);
    }
  });
  container.setData("pendingMethodCalls", []);
}