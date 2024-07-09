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

  constructor(
    plugin: PsdToPhaserPlugin,
    camera: Phaser.Cameras.Scene2D.Camera,
    psdKey: string,
    config: LazyLoadingOptions = {}
  ) {
    this.plugin = plugin;
    this.camera = camera;
    this.psdKey = psdKey;
    this.basePath = this.plugin.getData(psdKey).basePath;
    this.config = {
      active: true,
      preloadRange: 300,
      transitionStyle: "fade",
      ...config,
    };

    this.initializeLazyObjects();
    this.setupEvents();
  }

  private initializeLazyObjects() {
    const psdData = this.plugin.getData(this.psdKey);
    if (psdData && psdData.lazyLoadObjects) {
      this.lazyObjects = psdData.lazyLoadObjects.map((obj) => ({
        ...obj,
        loaded: false,
      }));
      console.log("Lazy objects initialized:", this.lazyObjects);
    } else {
      console.warn(`No lazy load objects found for PSD key: ${this.psdKey}`);
    }
  }

  private setupEvents() {
    this.camera.scene.events.on("update", this.update, this);
  }

  public update = () => {
    if (!this.config.active) return;

    this.checkVisibility();
    this.processLoadQueue();
  };

  private checkVisibility() {
    const worldView = this.camera.worldView;
    const preloadRange = this.config.preloadRange || 0;
    const extendedView = new Phaser.Geom.Rectangle(
      worldView.x - preloadRange,
      worldView.y - preloadRange,
      worldView.width + preloadRange * 2,
      worldView.height + preloadRange * 2
    );

    this.lazyObjects.forEach((object) => {
      if (this.isObjectInView(object, extendedView)) {
        if (
          !object.loaded &&
          !this.loadingObjects.includes(object) &&
          !this.loadQueue.includes(object)
        ) {
          this.loadQueue.push(object);
        }
      } else if (object.loaded) {
        this.unloadObject(object);
      }
    });
  }

  private isObjectInView(object: any, view: Phaser.Geom.Rectangle): boolean {
    const objectRect = new Phaser.Geom.Rectangle(
      object.x,
      object.y - (object.height || 0),
      object.width || 0,
      object.height || 0
    );
    return Phaser.Geom.Intersects.RectangleToRectangle(objectRect, view);
  }

  private processLoadQueue() {
    if (this.loadQueue.length > 0 && this.loadingObjects.length < 5) {
      // Limit concurrent loading
      const object = this.loadQueue.shift();
      this.loadObject(object);
    }
  }

  private loadObject(object: any) {
    this.loadingObjects.push(object);
    this.camera.scene.events.emit("lazyLoadStart", object);

    if (object.type === "sprite" || object.type === "simple") {
      this.loadSprite(object);
    } else if (object.type === "tile") {
      this.loadTile(object);
    } else {
      console.error("Unknown object type:", object.type);
      this.loadingObjects = this.loadingObjects.filter((obj) => obj !== object);
    }
  }

  private loadSprite(object: any) {
    new Promise<void>((resolve, reject) => {
      try {
        const result = this.plugin.sprites.place(
          this.camera.scene,
          this.psdKey,
          object.path
        );
        if (result && typeof result.then === "function") {
          result.then(resolve).catch(reject);
        } else {
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    })
      .then(() => {
        this.finishLoading(object);
      })
      .catch((error) => {
        console.error("Error loading sprite:", error);
        this.loadingObjects = this.loadingObjects.filter(
          (obj) => obj !== object
        );
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

    if (progress === 1) {
      this.camera.scene.events.emit("loadingComplete");
    }
  }

  private unloadObject(object: any) {
    // For now, just mark it as unloaded without actually removing it
    object.loaded = false;
    this.camera.scene.events.emit("objectUnloaded", object);
  }

  public updateConfig(config: Partial<LazyLoadingOptions>) {
    Object.assign(this.config, config);
    console.log("LazyLoadCamera config updated:", this.config);
  }
}
