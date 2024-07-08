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

  // Search in zones
  if (data.zones && Array.isArray(data.zones)) {
    data.zones.forEach((zone: any) => recursiveFind(zone));
  }

  // Search in points
  if (data.points && Array.isArray(data.points)) {
    data.points.forEach((point: any) => recursiveFind(point));
  }

  return lazyObjects;
}
