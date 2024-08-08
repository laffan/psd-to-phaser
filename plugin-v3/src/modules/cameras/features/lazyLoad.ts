// src/modules/cameras/features/lazyLoad.ts

import PsdToPhaserPlugin from "../../../PsdToPhaserPlugin";
// import { loadSprites } from "../../load/loadSprites";
// import { loadSingleTile } from "../../load/loadTiles";
import { loadItems } from "../../load/loadItems";
import { placeSprites } from "../../place/types/sprites";
import { placeSingleTile } from "../../place/types/tiles";

export interface LazyLoadOptions {
  extendPreloadBounds?: number;
  checkInterval?: number;
  debug?: {
    shape?: boolean;
    label?: boolean;
  };
}

export function LazyLoadCamera(
  plugin: PsdToPhaserPlugin,
  camera: Phaser.Cameras.Scene2D.Camera,
  psdKey: string,
  options: LazyLoadOptions = {}
) {
  const scene = camera.scene;
  const psdData = plugin.getData(psdKey);
  if (!psdData || !psdData.lazyLoad) {
    console.error(`No lazy load data found for key: ${psdKey}`);
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

    lazyLoadObjects = [
      ...(psdData.lazyLoad.sprites || []).map(createObject),
      ...(psdData.lazyLoad.tiles || []).flatMap((tileset) =>
        tileToLazyObjects(tileset).map(createObject)
      ),
    ];

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
      console.log(`LazyLoad: ${objectsToLoad.length} objects to load`);
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

    console.log(`LazyLoad: Loading object ${key}`);

    // Format the data for loadItems
    const formattedData = {
      sprites: data.category === 'sprite' ? [data] : [],
      singleTiles: (data.category === 'tile' || data.category === 'tileset') ? [data] : []
    };

    loadItems(scene, psdKey, formattedData, plugin);

    scene.load.once('complete', () => {
      onObjectLoaded(data);
    });

    scene.load.start();
  }

  function onObjectLoaded(data: any) {
    const key = getObjectKey(data);
    objectsBeingLoaded.delete(key);

    data.loaded = true;

    console.log(`LazyLoad: Object loaded ${key}`);

    if (data.category === "sprite") {
      placeSprites(scene, data, plugin, scene.children, () => {}, psdKey);
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
        scene.children as Phaser.GameObjects.Group
      );
    }

    const progress =
      lazyLoadObjects.filter(({ data }) => data.loaded).length /
      lazyLoadObjects.length;
    const remainingObjects = Array.from(objectsBeingLoaded);
    scene.events.emit("lazyLoadProgress", progress, remainingObjects);
    console.log(
      `LazyLoad: Progress ${progress.toFixed(2)}, Remaining:`,
      remainingObjects
    );

    if (lazyLoadObjects.every(({ data }) => data.loaded)) {
      scene.events.emit("lazyLoadingComplete");
      console.log("LazyLoad: All objects loaded");
    }

    updateDebugGraphics();
  }

  function tileToLazyObjects(tileset: any) {
    const objects = [];
    for (let col = 0; col < tileset.columns; col++) {
      for (let row = 0; row < tileset.rows; row++) {
        objects.push({
          category: "tile",
          name: `${tileset.name}_tile_${col}_${row}`,
          x: tileset.x + col * (tileset.width / tileset.columns),
          y: tileset.y + row * (tileset.height / tileset.rows),
          width: tileset.width / tileset.columns,
          height: tileset.height / tileset.rows,
          tile_slice_size: psdData.original.tile_slice_size,
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
