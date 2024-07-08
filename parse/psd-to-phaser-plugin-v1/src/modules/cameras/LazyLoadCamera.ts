import PsdToPhaserPlugin from "../../PsdToPhaserPlugin";
import { LazyLoadingOptions } from "../typeDefinitions";

export class LazyLoadCamera {
  private plugin: PsdToPhaserPlugin;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private config: LazyLoadingOptions;
  private lazyLayers: string[] = [];

  constructor(plugin: PsdToPhaserPlugin, camera: Phaser.Cameras.Scene2D.Camera, config: LazyLoadingOptions = {}) {
    this.plugin = plugin;
    this.camera = camera;
    this.config = config;

    this.setupEvents();
  }

  private setupEvents() {
    this.camera.scene.events.on('update', this.checkVisibility, this);
  }

  public registerLazyLayers(layers: string[], psdKey: string) {
    this.lazyLayers = layers;
    layers.forEach(layer => {
      const layerData = this.plugin.getData(psdKey).layers.find((l: any) => l.name === layer);
      if (layerData) {
        layerData.objects.forEach((object: any) => {
          if (object.lazyLoad) {
            this.plugin.storageManager.store(psdKey, `${layer}/${object.name}`, { ...object, loaded: false });
          }
        });
      }
    });
  }

  public checkVisibility() {
    const worldView = this.camera.worldView;
    const preloadRange = this.config.preloadRange || 0;
    const extendedView = new Phaser.Geom.Rectangle(
      worldView.x - preloadRange,
      worldView.y - preloadRange,
      worldView.width + preloadRange * 2,
      worldView.height + preloadRange * 2
    );

    this.lazyLayers.forEach(layer => {
      const layerObjects = this.plugin.storageManager.getAll(layer);
      layerObjects.forEach(object => {
        if (this.isObjectInView(object, extendedView)) {
          if (!object.loaded) {
            this.loadObject(object);
          }
        } else if (object.loaded) {
          this.unloadObject(object);
        }
      });
    });
  }

  private isObjectInView(object: any, view: Phaser.Geom.Rectangle): boolean {
    const objectRect = new Phaser.Geom.Rectangle(
      object.x,
      object.y - object.height,
      object.width,
      object.height
    );
    return Phaser.Geom.Intersects.RectangleToRectangle(objectRect, view);
  }

  private loadObject(object: any) {
    // Implement loading logic here
    // This should handle both sprites and tile layers
    this.camera.scene.events.emit('objectLoading', object);
    
    // Load the object (implement the actual loading logic)
    // For example:
    // if (object.type === 'sprite') {
    //   this.plugin.sprites.place(this.camera.scene, object.psdKey, object.path);
    // } else if (object.type === 'tile') {
    //   this.plugin.tiles.place(this.camera.scene, object.psdKey, object.path);
    // }

    object.loaded = true;
    this.camera.scene.events.emit('objectLoaded', object);

    // Check if all objects are loaded
    const allLoaded = this.lazyLayers.every(layer => 
      this.plugin.storageManager.getAll(layer).every((obj: any) => obj.loaded)
    );
    if (allLoaded) {
      this.camera.scene.events.emit('allObjectsLoaded');
    }
  }

  private unloadObject(object: any) {
    // Implement unloading logic here
    // This should handle both sprites and tile layers
    object.loaded = false;
    
    // Unload the object (implement the actual unloading logic)
    // For example:
    // if (object.type === 'sprite') {
    //   this.plugin.sprites.remove(object.psdKey, object.path);
    // } else if (object.type === 'tile') {
    //   this.plugin.tiles.remove(object.psdKey, object.path);
    // }

    this.camera.scene.events.emit('objectUnloaded', object);
  }

  public updateConfig(config: Partial<LazyLoadingOptions>) {
    Object.assign(this.config, config);
  }
}