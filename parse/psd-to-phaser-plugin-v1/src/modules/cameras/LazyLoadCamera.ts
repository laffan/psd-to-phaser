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
  private lastCameraPosition: Phaser.Math.Vector2;
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

    this.lastCameraPosition = new Phaser.Math.Vector2(
      this.camera.scrollX,
      this.camera.scrollY
    );
    this.preloadBounds = new Phaser.Geom.Rectangle(0, 0, 0, 0); // Initialize with dummy values

    this.initializeLazyObjects();
    this.setupEvents();
    this.setupDebug();
    this.updatePreloadBounds(); // Now safe to call this
  }

  private initializeLazyObjects() {
    const psdData = this.plugin.getData(this.psdKey);
    if (psdData && psdData.lazyLoadObjects) {
      this.lazyObjects = psdData.lazyLoadObjects.map((obj) => ({
        ...obj,
        loaded: false,
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
      this.updateDebugGraphics(); // Draw initial debug shape
    }
  }

  public update = () => {
    if (!this.config.active) return;

    const currentPosition = new Phaser.Math.Vector2(
      this.camera.scrollX,
      this.camera.scrollY
    );
    if (!currentPosition.equals(this.lastCameraPosition)) {
      this.lastCameraPosition = currentPosition;
      this.updatePreloadBounds();
      this.checkVisibility();
      this.updateDebugGraphics();
    }

    this.processLoadQueue();
  };

  public forceUpdate() {
    if (this.config.active) {
      this.updatePreloadBounds();
      this.checkVisibility();
      this.updateDebugGraphics();
      this.processLoadQueue();
    }
  }

  private updatePreloadBounds() {
    const extend = this.config.extendPreloadBounds || 0;
    const cameraView = this.getCameraView();
    this.preloadBounds.setTo(
      cameraView.x - extend,
      cameraView.y - extend,
      cameraView.width + extend * 2,
      cameraView.height + extend * 2
    );
  }

  private getCameraView(): Phaser.Geom.Rectangle {
    // If the camera's worldView is properly set, use it
    if (
      this.camera.worldView &&
      this.camera.worldView.width > 0 &&
      this.camera.worldView.height > 0
    ) {
      return this.camera.worldView;
    }

    // Otherwise, construct a view based on the camera's position and size
    return new Phaser.Geom.Rectangle(
      this.camera.scrollX,
      this.camera.scrollY,
      this.camera.width,
      this.camera.height
    );
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
      object.type === "sprite"
        ? this.loadSprite(object)
        : this.loadTile(object);

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
        const key = `${this.psdKey}_${object.name}`;
        const url = `${this.plugin.getData(this.psdKey).basePath}/${
          object.filePath
        }`;

        this.camera.scene.load.image(key, url);
        this.camera.scene.load.once(`filecomplete-image-${key}`, () => {
          const sprite = this.camera.scene.add.image(object.x, object.y, key);
          sprite.setOrigin(0, 0);
          resolve();
        });
        this.camera.scene.load.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  private loadTile(object: any) {
    return new Promise<void>((resolve, reject) => {
      const key = object.name;
      const url = `${this.plugin.getData(this.psdKey).basePath}/${object.path}`;

      this.camera.scene.load.image(key, url);
      this.camera.scene.load.once(`filecomplete-image-${key}`, () => {
        try {
          const tile = this.camera.scene.add.image(object.x, object.y, key);
          tile.setOrigin(0, 0);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
      this.camera.scene.load.once(`loaderror`, (file) => {
        if (file.key === key) {
          reject(new Error(`Failed to load tile: ${key}`));
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
    if (this.debugGraphics && this.config.debug && this.config.debug.shape) {
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
  }

  private getCameraView(): Phaser.Geom.Rectangle {
    // If the camera's worldView is properly set, use it
    if (
      this.camera.worldView &&
      this.camera.worldView.width > 0 &&
      this.camera.worldView.height > 0
    ) {
      return this.camera.worldView;
    }

    // Otherwise, construct a view based on the camera's position and size
    return new Phaser.Geom.Rectangle(
      this.camera.scrollX,
      this.camera.scrollY,
      this.camera.width,
      this.camera.height
    );
  }

  public updateConfig(config: Partial<LazyLoadingOptions>) {
    Object.assign(this.config, config);
    this.updatePreloadBounds();
    console.log("LazyLoadCamera config updated:", this.config);
  }
}
