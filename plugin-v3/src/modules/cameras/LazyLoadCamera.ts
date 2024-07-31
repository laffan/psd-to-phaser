// src/modules/cameras/LazyLoadCamera.ts

import PsdToPhaserPlugin from "../../PsdToPhaserPlugin";
import { LazyLoadingOptions } from "../typeDefinitions";

export class LazyLoadCamera {
  private plugin: PsdToPhaserPlugin;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private config: LazyLoadingOptions;
  private psdKey: string;
  private lazyObjects: any[] = [];
  private loadingObjects: any[] = [];
  private loadQueue: any[] = [];
  private preloadBounds: Phaser.Geom.Rectangle;
  private debugGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor(
    plugin: PsdToPhaserPlugin,
    camera: Phaser.Cameras.Scene2D.Camera,
    psdKey: string,
    config: LazyLoadingOptions = {}
  ) {
    this.plugin = plugin;
    this.camera = camera;
    this.psdKey = psdKey;
    this.config = {
      active: true,
      extendPreloadBounds: 0,
      transitionStyle: "fade",
      debug: { shape: false },
      ...config,
    };

    this.preloadBounds = new Phaser.Geom.Rectangle();

    this.initializeLazyObjects();
    this.setupEvents();
    this.setupDebug();
    this.updatePreloadBounds();
  }

  private initializeLazyObjects() {
    const psdData = this.plugin.getData(this.psdKey);
    if (psdData && psdData.lazyLoadObjects) {
      this.lazyObjects = psdData.lazyLoadObjects.map((obj) => ({
        ...obj,
        loaded: false,
        loading: false,
      }));
    } else {
      console.warn(`No lazy load objects found for PSD key: ${this.psdKey}`);
    }
  }

  private setupEvents() {
    this.camera.scene.events.on("update", this.update, this);
  }

  private setupDebug() {
    if (this.config.debug && this.config.debug.shape) {
      this.debugGraphics = this.camera.scene.add.graphics();
      this.debugGraphics.setDepth(1000);
    }
  }

  private updatePreloadBounds() {
    const extend = this.config.extendPreloadBounds || 0;
    this.preloadBounds.setTo(
      this.camera.scrollX - extend,
      this.camera.scrollY - extend,
      this.camera.width + extend * 2,
      this.camera.height + extend * 2
    );
  }

  public update = () => {
    if (!this.config.active) return;

    this.updatePreloadBounds();
    this.checkVisibility();
    this.processLoadQueue();
    this.updateDebugGraphics();
  };

  public forceUpdate() {
    if (this.config.active) {
      this.updatePreloadBounds();
      this.checkVisibility();
      this.processLoadQueue();
      this.updateDebugGraphics();
    }
  }

  private checkVisibility() {
    this.lazyObjects.forEach((object) => {
      if (!object.loaded && !object.loading) {
        const objectRect = new Phaser.Geom.Rectangle(
          object.x,
          object.y,
          object.width,
          object.height
        );
        if (
          Phaser.Geom.Intersects.RectangleToRectangle(
            objectRect,
            this.preloadBounds
          )
        ) {
          this.queueForLoading(object);
        }
      }
    });
  }

  private queueForLoading(object: any) {
    if (!this.loadQueue.includes(object)) {
      this.loadQueue.push(object);
      object.loading = true;
    }
  }

  private processLoadQueue() {
    const maxConcurrentLoads = 2;
    while (
      this.loadingObjects.length < maxConcurrentLoads &&
      this.loadQueue.length > 0
    ) {
      const object = this.loadQueue.shift();
      if (object) {
        this.loadObject(object);
      }
    }
  }

  private loadObject(object: any) {
    this.loadingObjects.push(object);
    this.camera.scene.events.emit("lazyLoadStart", object);

    const loadPromise =
      object.type === "tile" ? this.loadTile(object) : this.loadSprite(object);

    loadPromise
      .then(() => {
        this.finishLoading(object);
      })
      .catch((error) => {
        console.error(`Error loading ${object.type}:`, error);
        object.loading = false;
        this.loadingObjects = this.loadingObjects.filter(
          (obj) => obj !== object
        );
      });
  }

  private loadSprite(object: any) {
    return new Promise<void>((resolve, reject) => {
      try {
        const key = object.name;
        const url = `${this.plugin.getData(this.psdKey).basePath}/${
          object.filePath
        }`;

        this.camera.scene.load.image(key, url);
        this.camera.scene.load.once(`filecomplete-image-${key}`, () => {
          const sprite = this.camera.scene.add.sprite(object.x, object.y, key);
          sprite.setName(object.name);
          sprite.setOrigin(0, 0);
          if (object.initialDepth !== undefined) {
            sprite.setDepth(object.initialDepth);
          }
          const wrappedSprite = {
            name: object.name,
            type: "sprite",
            placed: sprite,
          };
          this.plugin.storageManager.addToGroup(
            this.psdKey,
            object.path.split("/").slice(0, -1).join("/"),
            wrappedSprite
          );
          resolve();
        });
        this.camera.scene.load.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  private loadTile(tile: any) {
    return new Promise<void>((resolve, reject) => {
      const tileKey = tile.name;
      const tilePath = `${this.plugin.getData(this.psdKey).basePath}/${
        tile.path
      }`;

      this.camera.scene.load.image(tileKey, tilePath);
      this.camera.scene.load.once(`filecomplete-image-${tileKey}`, () => {
        try {
          const tileImage = this.camera.scene.add.image(
            tile.x,
            tile.y,
            tileKey
          );
          tileImage.setOrigin(0, 0);
          tileImage.setDepth(tile.initialDepth || 0);

          this.plugin.storageManager.store(this.psdKey, tile.path, {
            name: tile.name,
            type: "tile",
            placed: tileImage,
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      });
      this.camera.scene.load.start();
    });
  }

  private finishLoading(object: any) {
    object.loaded = true;
    object.loading = false;
    this.loadingObjects = this.loadingObjects.filter((obj) => obj !== object);
    this.camera.scene.events.emit("objectLoaded", object);

    const progress =
      this.lazyObjects.filter((obj) => obj.loaded).length /
      this.lazyObjects.length;
    this.camera.scene.events.emit(
      "loadProgress",
      progress,
      this.loadingObjects
    );

    if (this.lazyObjects.every((obj) => obj.loaded)) {
      this.camera.scene.events.emit("loadingComplete");
    }
  }

  private updateDebugGraphics() {
    if (!this.debugGraphics || !this.config.debug?.shape) return;

    this.debugGraphics.clear();

    // Draw preload bounds
    this.debugGraphics.lineStyle(2, 0xff0000, 1);
    this.debugGraphics.strokeRect(
      this.preloadBounds.x,
      this.preloadBounds.y,
      this.preloadBounds.width,
      this.preloadBounds.height
    );

    // Draw lazy object bounds
    this.debugGraphics.lineStyle(2, 0x00ff00, 1);
    this.lazyObjects.forEach((object) => {
      this.debugGraphics.strokeRect(
        object.x,
        object.y,
        object.width,
        object.height
      );
    });
  }

  public updateConfig(config: Partial<LazyLoadingOptions>) {
    Object.assign(this.config, config);
    this.updatePreloadBounds();
    console.log("LazyLoadCamera config updated:", this.config);
  }
}
