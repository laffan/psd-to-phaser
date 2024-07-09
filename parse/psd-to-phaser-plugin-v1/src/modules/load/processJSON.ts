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

  const { immediateSprites, lazySprites } = separateSprites(data.sprites);
  const lazyLoadObjects = findLazyLoadObjects(data, lazySprites);

  console.log("===============");
  console.log("SPRITES", data.sprites);
  console.log("IMMEDIATE", immediateSprites);
  console.log("LAZY", lazySprites);
  console.log("===============");

  const processedData = {
    ...data,
    basePath: psdFolderPath,
    sprites: immediateSprites,
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

function separateSprites(sprites: any[]): { immediateSprites: any[], lazySprites: any[] } {
  const immediateSprites: any[] = [];
  const lazySprites: any[] = [];

  function recursiveSeparate(sprite: any, isParentLazy: boolean = false) {
    const isLazy = isParentLazy || sprite.lazyLoad === true;
    
    if (isLazy) {
      if (!sprite.children) {
        lazySprites.push(sprite);
      }
    } else {
      immediateSprites.push(sprite);
    }

    if (sprite.children && Array.isArray(sprite.children)) {
      sprite.children.forEach((child: any) => recursiveSeparate(child, isLazy));
    }
  }

  sprites.forEach(sprite => recursiveSeparate(sprite));

  return { immediateSprites, lazySprites };
}

function findLazyLoadObjects(data: any, lazySprites: any[]): any[] {
  const lazyObjects: any[] = [];

  function recursiveFind(obj: any, path: string = "") {
    if (!obj.children) {
      lazyObjects.push({ ...obj, path, type: 'sprite' });
    }
    if (obj.children && Array.isArray(obj.children)) {
      obj.children.forEach((child: any) => {
        recursiveFind(child, path ? `${path}/${child.name}` : child.name);
      });
    }
  }

  lazySprites.forEach(sprite => recursiveFind(sprite));

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
              transparent: layer.type === "transparent"
            });
          }
        }
      }
    });
  }

  return lazyObjects;
}