/**
 * Place module – instantiates loaded PSD layers as Phaser game objects,
 * preserving the original PSD hierarchy, positions, and depth ordering.
 *
 * @module place
 */

import PsdToPhaserPlugin from "../../PsdToPhaser";
import { placeTiles } from "./types/tiles";
import { placeSprites } from "./types/sprites";
import { placeZones } from "./types/zones";
import { placePoints } from "./types/points";
import { attachMethods } from "../shared/attachedMethods";
import { findLayer } from "../shared/findLayer";
import {
  checkIfLazyLoaded,
  createLazyLoadPlaceholder,
} from "../shared/lazyLoadUtils";
import { applySharedMaskToGroup } from "../shared/applyMask";

import type { PsdLayer, PlaceOptions } from "../../types";
import { isGroupLayer, isSpriteLayer, isTilesetLayer, isZoneLayer, isPointLayer, hasMask } from "../../types";

/**
 * Factory that creates the public `place()` function bound to the plugin.
 *
 * @param plugin - The PsdToPhaser plugin instance
 * @returns The `place()` function
 *
 * @internal
 */
export default function placeModule(plugin: PsdToPhaserPlugin) {
  /**
   * Place a layer (or layer group) into the scene.
   *
   * Supports slash-delimited paths to target nested layers. When placing a
   * group, all descendants are placed recursively unless limited by `depth`.
   * The returned object has attached helper methods: `target()`, `remove()`,
   * `setAlpha()`, `setScale()`, etc.
   *
   * Emits a `"layerPlaced"` event on the scene when placement finishes.
   *
   * @param scene - The Phaser scene to place objects into
   * @param psdKey - The key used when loading the PSD
   * @param layerPath - Slash-delimited path to the layer (e.g. `"root"` or `"groupName/spriteName"`)
   * @param options - Optional placement settings (depth limit, animation overrides)
   * @returns The placed game object or group, with attached helper methods
   *
   * @example
   * ```js
   * // Place an entire layer tree
   * const psd = this.P2P.place(this, "psd_key", "root");
   *
   * // Place a specific nested sprite
   * const sprite = this.P2P.place(this, "psd_key", "root/spriteName");
   *
   * // Limit recursion depth
   * const shallow = this.P2P.place(this, "psd_key", "group", { depth: 1 });
   * ```
   */
  return function place(
    scene: Phaser.Scene,
    psdKey: string,
    layerPath: string,
    options: PlaceOptions = {}
  ): Phaser.GameObjects.GameObject | Phaser.GameObjects.Group {
    const psdData = plugin.getData(psdKey);
    if (!psdData || !psdData.original) {
      console.error(`No data found for key: ${psdKey}`);
      return scene.add.group();
    }

    const tileSliceSize = psdData.original.tile_slice_size || 150;
    const group = scene.add.group();

    const targetLayer = findLayer(
      psdData.original.layers,
      layerPath.split("/")
    );
    if (!targetLayer) {
      console.error(`No layer found with path: ${layerPath}`);
      return group;
    }

    const placedObject = placeLayer(
      scene,
      targetLayer,
      plugin,
      tileSliceSize,
      group,
      psdKey,
      options
    );

    attachMethods(plugin, placedObject);

    scene.events.emit("layerPlaced", layerPath);

    return placedObject;
  };
}

/**
 * Recursively place a single layer, dispatching to the correct handler
 * based on layer category (group, tileset, sprite, zone, point).
 *
 * Groups are expanded recursively (respecting the `depth` option).
 * Lazy-loaded layers get a placeholder instead of a real game object.
 *
 * @internal
 */
function placeLayer(
  scene: Phaser.Scene,
  layer: PsdLayer,
  plugin: PsdToPhaserPlugin,
  tileSliceSize: number,
  group: Phaser.GameObjects.Group,
  psdKey: string,
  options: PlaceOptions
): Phaser.GameObjects.GameObject | Phaser.GameObjects.Group {
  if (isGroupLayer(layer)) {
    if (options.depth === undefined || options.depth > 0) {
      const newGroup = scene.add.group();
      newGroup.name = layer.name;

      layer.children.forEach((child) => {
        const childObject = placeLayer(
          scene,
          child,
          plugin,
          tileSliceSize,
          newGroup,
          psdKey,
          {
            ...options,
            depth: options.depth !== undefined ? options.depth - 1 : undefined,
          }
        );
        if (childObject instanceof Phaser.GameObjects.GameObject) {
          newGroup.add(childObject);
        }
      });

      // Apply a shared bitmap mask to all children if the group has a mask
      // Creates ONE mask and applies it to ALL children (masks are global in Phaser)
      if (hasMask(layer)) {
        applySharedMaskToGroup(scene, layer, newGroup);
      }

      group.add(newGroup as unknown as Phaser.GameObjects.GameObject);
      return newGroup;
    }
    return group;
  }

  const isLazyLoaded = checkIfLazyLoaded(plugin, psdKey, layer);

  if (isLazyLoaded) {
    const debugShape = createLazyLoadPlaceholder(scene, layer, plugin);
    if (debugShape) {
      group.add(debugShape);
    }
    return group;
  }

  if (isTilesetLayer(layer)) {
    placeTiles(scene, layer, plugin, tileSliceSize, group, () => {}, psdKey);
    return group;
  }

  if (isSpriteLayer(layer)) {
    placeSprites(scene, layer, plugin, group, () => {}, psdKey, options.animationOptions);
    return group;
  }

  if (isZoneLayer(layer)) {
    placeZones(scene, layer, plugin, group, () => {}, psdKey);
    return group;
  }

  if (isPointLayer(layer)) {
    placePoints(scene, layer, plugin, group, () => {}, psdKey);
    return group;
  }

  console.error(`Unknown layer category: ${(layer as { category?: string }).category}`);
  return group;
}
