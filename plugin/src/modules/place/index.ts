// src/modules/place/index.ts

import PsdToPhaserPlugin from "../../PsdToPhaserPlugin";
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

export default function placeModule(plugin: PsdToPhaserPlugin) {
  return function place(
    scene: Phaser.Scene,
    psdKey: string,
    layerPath: string,
    options: { depth?: number } = {}
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

function placeLayer(
  scene: Phaser.Scene,
  layer: any,
  plugin: PsdToPhaserPlugin,
  tileSliceSize: number,
  group: Phaser.GameObjects.Group,
  psdKey: string,
  options: { depth?: number }
): Phaser.GameObjects.GameObject | Phaser.GameObjects.Group {
  if (layer.category === "group") {
    if (
      Array.isArray(layer.children) &&
      (options.depth === undefined || options.depth > 0)
    ) {
      const newGroup = scene.add.group(); 
      newGroup.name = layer.name; 

      layer.children.forEach((child: any) => {
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
      group.add(newGroup); // Add the new group to the parent group
      return newGroup;
    }
    return group;
  } else {
    let placedObject:
      | Phaser.GameObjects.GameObject
      | Phaser.GameObjects.Group
      | null = null;

    // Check if the layer is lazy loaded
    const isLazyLoaded = checkIfLazyLoaded(plugin, psdKey, layer);

    if (isLazyLoaded) {
      const debugShape = createLazyLoadPlaceholder(
        scene,
        { ...layer, psdKey },
        plugin
      );
      if (debugShape) {
        group.add(debugShape);
      }
      return;
    }

    if (!isLazyLoaded) {
      switch (layer.category) {
        case "tileset":
          placedObject = placeTiles(
            scene,
            layer,
            plugin,
            tileSliceSize,
            group,
            () => {},
            psdKey
          );
          break;
        case "sprite":
          placedObject = placeSprites(
            scene,
            layer,
            plugin,
            group,
            () => {},
            psdKey
          );
          break;
        case "zone":
          placedObject = placeZones(
            scene,
            layer,
            plugin,
            group,
            () => {},
            psdKey
          );
          break;
        case "point":
          placedObject = placePoints(
            scene,
            layer,
            plugin,
            group,
            () => {},
            psdKey
          );
          break;
        default:
          console.error(`Unknown layer category: ${layer.category}`);
      }
    } else {
      // Create a placeholder for lazy loaded objects
      placedObject = createLazyLoadPlaceholder(scene, layer, plugin);
    }

    return placedObject || group;
  }
}