import Phaser from 'phaser';
import { StorageManager } from './core/StorageManager';
import loadModule from './modules/load';
import placeModule from './modules/place';
import placeAllModule from './modules/placeAll';
import getTextureModule from './modules/getTexture';
import { createCamera } from './modules/cameras/create';

// import getModule from './modules/get';
// import camerasModule from './modules/cameras/create';
// import useModule from './modules/use';

export interface DebugOptions {
  shape?: boolean;
  label?: boolean;
  console?: boolean;
}

export interface PluginOptions {
  debug?: boolean | DebugOptions;
  lazyLoadAll?: boolean;
  applyAlphaAll?: boolean;
  applyBlendModesAll?: boolean;
}

export default class PsdToPhaserPlugin extends Phaser.Plugins.BasePlugin {
  private psdData: Record<string, any> = {};
  public storageManager: StorageManager;
  public options: PluginOptions;

  public load: ReturnType<typeof loadModule>;
  public place: ReturnType<typeof placeModule>;
  public placeAll: ReturnType<typeof placeAllModule>;
  public getTexture: ReturnType<typeof getTextureModule>;
  public createCamera: typeof createCamera;

  // public get: ReturnType<typeof getModule>;
  // public cameras: ReturnType<typeof camerasModule>;
  // public use: ReturnType<typeof useModule>;

  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);
    this.storageManager = new StorageManager();
    this.options = {};

    this.load = loadModule(this);
    this.place = placeModule(this);
    this.placeAll = placeAllModule(this);
    this.getTexture = getTextureModule(this);
    this.createCamera = createCamera.bind(null, this);

    // Initialize scene property
    // this.scene = pluginManager.scene;
    // this.get = getModule(this);
    // this.cameras = camerasModule(this);
    // this.use = useModule(this);
  }

  init(options: PluginOptions = {}): void {
    this.options = {
      debug: false,
      lazyLoadAll: false,
      applyAlphaAll: false,
      applyBlendModesAll: false,
      ...options
    };

    if (typeof this.options.debug === 'boolean') {
      this.options.debug = this.options.debug ? { shape: true, label: true, console: true } : false;
    }

    if (this.options.debug) {
      console.log('PsdToPhaserPlugin initialized with options:', this.options);
    }
  }

  setData(key: string, data: any): void {
    this.psdData[key] = data;
    if (this.isDebugEnabled('console')) {
      console.log(`Data set for key "${key}":`, data);
    }
  }

  getData(key: string): any {
    if (this.isDebugEnabled('console')) {
    }
    return this.psdData[key];
  }

  isDebugEnabled(option: keyof DebugOptions): boolean {
    return typeof this.options.debug === 'object' && !!this.options.debug[option];
  }
}