// src/modules/cameras/features/lazyLoad.ts

import PsdToPhaserPlugin from "../../../PsdToPhaser";
import { loadItems } from "../../load/loadItems";
import { placeSprites } from "../../place/types/sprites";
import { placeSingleTile } from "../../place/types/tiles";

import type { LazyLoadCameraOptions } from "../../../types";

// Re-export for backwards compatibility
export type LazyLoadOptions = LazyLoadCameraOptions;

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
        const tileSliceSize = psdData.original.tile_slice_size ?? 150;
        psdData.lazyLoad.tiles.forEach((tileset: any) => {
          tileToLazyObjects(tileset, tileSliceSize).forEach((tile: any) => {
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
  let boundaryCamera: Phaser.Cameras.Scene2D.Camera | null = null;

  function init() {
    if (options.createBoundaryCamera) {
      createBoundaryCamera();
    }
    createLazyLoadBounds();
    createLazyLoadObjects();
    if (options.debug?.shape || options.debug?.label) {
      createDebugGraphics();
    }
    checkVisibility();
    setupInterval();
  }

  function createBoundaryCamera() {
    // Create invisible camera that follows the main camera but ignores zoom
    boundaryCamera = scene.cameras.add();
    boundaryCamera.setVisible(false);
    boundaryCamera.setZoom(1); // Always keep at zoom level 1
    
    // Position the boundary camera to match the main camera's position
    boundaryCamera.setScroll(camera.scrollX, camera.scrollY);
    boundaryCamera.setSize(camera.width, camera.height);
  }

  function createLazyLoadBounds() {
    const extend = options.extendPreloadBounds || 0;

    // If using boundary camera, calculate world position based on main camera's zoom
    if (boundaryCamera) {
      // Update boundary camera position to match main camera
      boundaryCamera.setScroll(camera.scrollX, camera.scrollY);
      
      // Calculate the actual viewport size in world coordinates
      const worldWidth = camera.width / camera.zoom;
      const worldHeight = camera.height / camera.zoom;
      
      // Center the bounds on the camera's center position
      const centerX = camera.scrollX + (camera.width / 2);
      const centerY = camera.scrollY + (camera.height / 2);
      
      lazyLoadBounds = new Phaser.Geom.Rectangle(
        centerX - (worldWidth / 2) - extend,
        centerY - (worldHeight / 2) - extend,
        worldWidth + extend * 2,
        worldHeight + extend * 2
      );
    } else {
      // Calculate world dimensions accounting for camera zoom
      // This ensures layers under the camera load immediately even when all are lazyLoad
      const worldWidth = camera.width / camera.zoom;
      const worldHeight = camera.height / camera.zoom;

      lazyLoadBounds = new Phaser.Geom.Rectangle(
        camera.scrollX - extend,
        camera.scrollY - extend,
        worldWidth + extend * 2,
        worldHeight + extend * 2
      );
    }
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
      tiles: [],
      zones: [],
      points: [],
      groups: [],
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

    if (data.category === "sprite") {
      // Create a group to hold the loaded objects for sprites
      const itemGroup = scene.add.group();
      placeSprites(scene, data, plugin, itemGroup, () => {
        // Force depth re-evaluation after sprite is placed
        itemGroup.getChildren().forEach((child: any) => {
          if (child.setDepth && data.initialDepth !== undefined) {
            child.setDepth(data.initialDepth);
          }
        });
        // Re-sort scene display list to ensure proper depth ordering
        scene.children.sort('depth');
      }, data._psdKey);
    } else if (data.category === "tile" || data.category === "tileset") {
      // For tiles, find the existing tile container or create one with proper depth
      const tileContainer = findOrCreateTileContainer(scene, data);
      placeSingleTile(
        scene,
        {
          x: data.x - tileContainer.x, // Adjust for container position
          y: data.y - tileContainer.y, // Adjust for container position
          key: `${data.tilesetName}_tile_${data.col}_${data.row}`,
          initialDepth: data.initialDepth,
          tilesetName: data.tilesetName,
          col: data.col,
          row: data.row,
        },
        tileContainer
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

  function findOrCreateTileContainer(scene: Phaser.Scene, tileData: any): Phaser.GameObjects.Container {
    // Look for existing tile container with the same name
    const existingContainer = scene.children.list.find(
      (child) => 
        child instanceof Phaser.GameObjects.Container && 
        child.name === tileData.tilesetName
    ) as Phaser.GameObjects.Container;

    if (existingContainer) {
      return existingContainer;
    }

    // Create new container with proper depth ordering
    // Position the container at the original tileset position
    const tilesetOriginX = tileData.x - (tileData.col * tileData.tile_slice_size);
    const tilesetOriginY = tileData.y - (tileData.row * tileData.tile_slice_size);
    const newContainer = scene.add.container(tilesetOriginX, tilesetOriginY);
    newContainer.setName(tileData.tilesetName);
    newContainer.setDepth(tileData.initialDepth);

    return newContainer;
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
      if (boundaryCamera) {
        scene.cameras.remove(boundaryCamera);
        boundaryCamera = null;
      }
    },
  };
}

function getAllPsdKeys(plugin: PsdToPhaserPlugin): string[] {
  return plugin.getAllKeys();
}
