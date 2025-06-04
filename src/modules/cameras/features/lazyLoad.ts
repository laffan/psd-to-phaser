// src/modules/cameras/features/lazyLoad.ts

import PsdToPhaserPlugin from "../../../PsdToPhaser";
import { loadItems } from "../../load/loadItems";
import { placeSprites } from "../../place/types/sprites";
import { placeSingleTile } from "../../place/types/tiles";

export interface LazyLoadOptions {
  targetKeys?: string[]; // Specific PSD keys to target, defaults to all PSDs
  extendPreloadBounds?: number;
  checkInterval?: number;
  debug?: {
    shape?: boolean;
    label?: boolean;
    console?: boolean;
  };
}

export function LazyLoadCamera(
  plugin: PsdToPhaserPlugin,
  camera: Phaser.Cameras.Scene2D.Camera,
  options: LazyLoadOptions = {}
) {
  const scene = camera.scene;
  
  // Determine which PSDs to target
  const targetKeys = options.targetKeys || getAllPsdKeys(plugin);
  
  if (targetKeys.length === 0) {
    console.warn('No PSDs found for lazy loading');
    return {};
  }
  
  // Collect lazy load data from all target PSDs
  const allLazyLoadData: any[] = [];
  const psdDataMap: Record<string, any> = {};
  
  targetKeys.forEach(psdKey => {
    const psdData = plugin.getData(psdKey);
    if (psdData && psdData.lazyLoad) {
      psdDataMap[psdKey] = psdData;
      // Add psdKey to each lazy load item for tracking
      if (psdData.lazyLoad.sprites) {
        psdData.lazyLoad.sprites.forEach((sprite: any) => {
          allLazyLoadData.push({ ...sprite, _psdKey: psdKey });
        });
      }
      if (psdData.lazyLoad.tiles) {
        psdData.lazyLoad.tiles.forEach((tileset: any) => {
          tileToLazyObjects(tileset, psdData.original.tile_slice_size).forEach((tile: any) => {
            allLazyLoadData.push({ ...tile, _psdKey: psdKey });
          });
        });
      }
    }
  });
  
  if (allLazyLoadData.length === 0) {
    if (options.debug?.console) {
      console.log('No lazy load items found in target PSDs:', targetKeys);
    }
    return {};
  }

  let lazyLoadBounds: Phaser.Geom.Rectangle;
  let debugGraphics: Phaser.GameObjects.Graphics | null = null;
  let lazyLoadObjects: Array<{
    boundary: Phaser.GameObjects.Rectangle;
    data: any;
  }> = [];
  let objectsBeingLoaded: Set<string> = new Set();
  let intervalId: number | null = null;

  function init() {
    createLazyLoadBounds();
    createLazyLoadObjects();
    if (options.debug?.shape || options.debug?.label) {
      createDebugGraphics();
    }
    checkVisibility();
    setupInterval();
  }

  function createLazyLoadBounds() {
    const extend = options.extendPreloadBounds || 0;
    lazyLoadBounds = new Phaser.Geom.Rectangle(
      camera.scrollX - extend,
      camera.scrollY - extend,
      camera.width + extend * 2,
      camera.height + extend * 2
    );
  }

  function createLazyLoadObjects() {
    const createObject = (obj: any) => {
      const boundary = scene.add.rectangle(obj.x, obj.y, obj.width, obj.height);
      boundary.setOrigin(0, 0);
      boundary.setStrokeStyle(1, 0x00ff00);
      boundary.setDepth(1000);
      return { boundary, data: { ...obj, loaded: false } };
    };

    // Use the collected lazy load data from all target PSDs
    lazyLoadObjects = allLazyLoadData.map(createObject);

    if (options.debug?.shape) {
      lazyLoadObjects.forEach((obj) => obj.boundary.setVisible(true));
    } else {
      lazyLoadObjects.forEach((obj) => obj.boundary.setVisible(false));
    }

    if (options.debug?.label) {
      lazyLoadObjects.forEach((obj) => {
        const text = scene.add.text(
          obj.boundary.x,
          obj.boundary.y - 20,
          obj.data.name,
          {
            fontSize: "12px",
            color: "#00ffff",
            backgroundColor: "#000000",
          }
        );
        text.setOrigin(0, 1);
        text.setDepth(1001);
      });
    }
  }

  function createDebugGraphics() {
    debugGraphics = scene.add.graphics();
    debugGraphics.setDepth(1000);
    updateDebugGraphics();
  }

  function updateDebugGraphics() {
    if (!debugGraphics) return;

    debugGraphics.clear();
    debugGraphics.lineStyle(2, 0xff00ff, 1);
    debugGraphics.strokeRect(
      lazyLoadBounds.x,
      lazyLoadBounds.y,
      lazyLoadBounds.width,
      lazyLoadBounds.height
    );
  }

  function checkVisibility() {
    const objectsToLoad = lazyLoadObjects.filter(
      ({ boundary, data }) =>
        !data.loaded &&
        !objectsBeingLoaded.has(getObjectKey(data)) &&
        Phaser.Geom.Intersects.RectangleToRectangle(
          boundary.getBounds(),
          lazyLoadBounds
        )
    );

    if (objectsToLoad.length > 0) {
      if (options.debug?.console) {
        console.log(`LazyLoad: ${objectsToLoad.length} objects to load`);
      }
      scene.events.emit("lazyLoadStart", objectsToLoad.length);
      objectsToLoad.forEach(loadObject);
    }
  }

  function getObjectKey(obj: any): string {
    if (!obj) return "unknown";
    const objectType = obj.category || obj.type;
    if (objectType === "tile" || objectType === "tileset") {
      return `tile_${obj.tilesetName || obj.name}_${obj.col}_${obj.row}`;
    }
    return `sprite_${obj.name}_${Math.round(obj.x)}_${Math.round(obj.y)}`;
  }

  function loadObject({ data }: { data: any }) {
    const key = getObjectKey(data);
    objectsBeingLoaded.add(key);
    const itemPsdKey = data._psdKey;

    if (options.debug?.console) {
      console.log(`LazyLoad: Loading object ${key} from PSD ${itemPsdKey}`);
    }
    // Format the data for loadItems
    const formattedData = {
      sprites: data.category === "sprite" ? [data] : [],
      singleTiles:
        data.category === "tile" || data.category === "tileset" ? [data] : [],
    };

    loadItems(scene, itemPsdKey, formattedData, plugin);

    scene.load.once("complete", () => {
      onObjectLoaded(data);
    });

    scene.load.start();
  }

  function onObjectLoaded(data: any) {
    const key = getObjectKey(data);
    objectsBeingLoaded.delete(key);

    data.loaded = true;
    if (options.debug?.console) {
      console.log(`LazyLoad: Object loaded ${key}`);
    }

    // Create a group to hold the loaded objects
    const itemGroup = scene.add.group();

    if (data.category === "sprite") {
      placeSprites(scene, data, plugin, itemGroup, () => {}, data._psdKey);
    } else if (data.category === "tile" || data.category === "tileset") {
      placeSingleTile(
        scene,
        {
          x: data.x,
          y: data.y,
          key: `${data.tilesetName}_tile_${data.col}_${data.row}`,
          initialDepth: data.initialDepth,
          tilesetName: data.tilesetName,
          col: data.col,
          row: data.row,
        },
        itemGroup
      );
    }

    const progress =
      lazyLoadObjects.filter(({ data }) => data.loaded).length /
      lazyLoadObjects.length;
    const remainingObjects = Array.from(objectsBeingLoaded);
    scene.events.emit("lazyLoadProgress", progress, remainingObjects);
    if (options.debug?.console) {
      console.log(
        `LazyLoad: Progress ${progress.toFixed(2)}, Remaining:`,
        remainingObjects
      );
    }
    if (lazyLoadObjects.every(({ data }) => data.loaded)) {
      scene.events.emit("lazyLoadingComplete");
      if (options.debug?.console) {
        console.log("LazyLoad: All objects loaded");
      }
    }

    updateDebugGraphics();
  }

  function tileToLazyObjects(tileset: any, tileSliceSize: number) {
    const objects = [];
    for (let col = 0; col < tileset.columns; col++) {
      for (let row = 0; row < tileset.rows; row++) {
        objects.push({
          category: "tile",
          name: `${tileset.name}_tile_${col}_${row}`,
          x: tileset.x + col * tileSliceSize,
          y: tileset.y + row * tileSliceSize,
          width: tileSliceSize,
          height: tileSliceSize,
          tile_slice_size: tileSliceSize,
          filetype: tileset.filetype || "png",
          tilesetName: tileset.name,
          col,
          row,
          initialDepth: tileset.initialDepth,
        });
      }
    }
    return objects;
  }

  function setupInterval() {
    const interval = options.checkInterval || 300;
    intervalId = window.setInterval(() => {
      update();
    }, interval);
  }

  function update() {
    createLazyLoadBounds();
    checkVisibility();
    if (options.debug?.shape || options.debug?.label) {
      updateDebugGraphics();
    }
  }

  init();

  return {
    update,
    destroy: () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
      lazyLoadObjects.forEach((obj) => obj.boundary.destroy());
      if (debugGraphics) {
        debugGraphics.destroy();
      }
    },
  };
}

function getAllPsdKeys(plugin: PsdToPhaserPlugin): string[] {
  // Access the private psdData property to get all keys
  const psdData = (plugin as any).psdData;
  return Object.keys(psdData || {});
}
