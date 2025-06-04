import Phaser from "phaser";
import loadModule from "./modules/load";
import placeModule from "./modules/place";
import getTextureModule from "./modules/getTexture";
import { createCamera, CameraOptions } from "./modules/cameras/create";
import useModule from "./modules/use"; // Updated import

export interface DebugOptions {
  shape?: boolean;
  label?: boolean;
  console?: boolean;
}

export interface PluginOptions {
  debug?: boolean | DebugOptions;
  applyAlphaAll?: boolean;
  applyBlendModesAll?: boolean;
}

export default class PsdToPhaser extends Phaser.Plugins.BasePlugin {
  private psdData: Record<string, any> = {};
  public options: PluginOptions;
  
  public load: ReturnType<typeof loadModule>;
  public place: ReturnType<typeof placeModule>;
  public getTexture: ReturnType<typeof getTextureModule>;
  public use: ReturnType<typeof useModule>;

  public createCamera: (
    camera: Phaser.Cameras.Scene2D.Camera,
    features: string[],
    options?: CameraOptions
  ) => ReturnType<typeof createCamera>;


  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);
    this.options = {};

console.log(
  "%c✨ PSD-to-Phaser v0.0.3 ✨",
  "background: black; color: white; padding: 1px 3px; border-radius: 2px;"
);
    this.load = loadModule(this);
    this.place = placeModule(this);
    this.getTexture = getTextureModule(this);
    this.use = useModule(this); // Initialize the presets module
    this.createCamera = (
      camera: Phaser.Cameras.Scene2D.Camera,
      features: string[],
      options?: CameraOptions
    ) => createCamera(this, camera, features, options);

  }

  init(options: PluginOptions = {}): void {
    this.options = {
      debug: false,
      applyAlphaAll: false,
      applyBlendModesAll: false,
      ...options,
    };

    if (typeof this.options.debug === "boolean") {
      this.options.debug = this.options.debug
        ? { shape: true, label: true, console: true }
        : false;
    }

    if (this.options.debug) {
      console.log("PsdToPhaserPlugin initialized with options:", this.options);
    }
  }

  setData(key: string, data: any): void {
    this.psdData[key] = data;
    if (this.isDebugEnabled("console")) {
      console.log(`Data set for key "${key}":`, data);
    }
  }

  getData(key: string): any {
    return this.psdData[key];
  }

  isDebugEnabled(option: keyof DebugOptions): boolean {
    return (
      typeof this.options.debug === "object" && !!this.options.debug[option]
    );
  }
}
