import { createPSDObject } from "../core/PSDObject";
import { loadAssetsFromJSON } from "./loadAssetsFromJSON";
import PsdToPhaserPlugin from "../../PsdToPhaserPlugin";

export function processJSON(
  scene: Phaser.Scene,
  key: string,
  data: any,
  psdFolderPath: string,
  plugin: PsdToPhaserPlugin
): void {
  console.log(`Processing JSON for key: ${key}`);

  if (!data) {
    console.error(`Data is null or undefined for key: ${key}`);
    return;
  }

  if (!data.sprites || !Array.isArray(data.sprites)) {
    console.error(`Invalid or missing sprites data for key: ${key}`);
    return;
  }

  const lazyLoadObjects = findLazyLoadObjects(data);

  const processedData = {
    ...data,
    basePath: psdFolderPath,
    sprites: data.sprites.map((spriteData: any) => createPSDObject(spriteData)),
    zones: Array.isArray(data.zones)
      ? data.zones.map((zoneData: any) => createPSDObject(zoneData))
      : [],
    points: Array.isArray(data.points)
      ? data.points.map((pointData: any) => createPSDObject(pointData))
      : [],
    lazyLoadObjects: lazyLoadObjects,
  };

  plugin.setData(key, processedData);

  if (plugin.options.debug) {
    console.log(`Processed JSON for key "${key}":`, processedData);
  }

  loadAssetsFromJSON(scene, key, processedData, plugin);
}

function findLazyLoadObjects(data: any): any[] {
  const lazyObjects: any[] = [];

  function recursiveFind(obj: any, path: string = "") {
    if (obj.lazyLoad === true) {
      lazyObjects.push({ ...obj, path });
    }
    if (obj.children && Array.isArray(obj.children)) {
      obj.children.forEach((child: any, index: number) => {
        recursiveFind(child, path ? `${path}/${child.name}` : child.name);
      });
    }
  }

  // Search in sprites
  if (data.sprites && Array.isArray(data.sprites)) {
    data.sprites.forEach((sprite: any) => recursiveFind(sprite));
  }

  // Search in tiles
  if (data.tiles && data.tiles.layers) {
    data.tiles.layers.forEach((layer: any) => {
      if (layer.lazyLoad) {
        const fileExtension = layer.type === "transparent" ? 'png' : 'jpg';
        for (let col = 0; col < data.tiles.columns; col++) {
          for (let row = 0; row < data.tiles.rows; row++) {
            const tileKey = `${layer.name}_tile_${col}_${row}`;
            lazyObjects.push({
              type: 'tile',
              name: tileKey,
              path: `tiles/${data.tiles.tile_slice_size}/${tileKey}.${fileExtension}`,
              x: col * data.tiles.tile_slice_size,
              y: row * data.tiles.tile_slice_size,
              width: data.tiles.tile_slice_size,
              height: data.tiles.tile_slice_size,
              lazyLoad: true,
              transparent: layer.transparent
            });
          }
        }
      }
    });
  }

  return lazyObjects;
}
