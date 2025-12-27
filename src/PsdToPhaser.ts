import Phaser from "phaser";
import loadModule from "./modules/load";
import placeModule from "./modules/place";
import getTextureModule from "./modules/getTexture";
import getMaskModule from "./modules/getMask";
import { createCamera } from "./modules/cameras/create";
import useModule from "./modules/use";

import type {
  DebugOptions,
  PluginOptions,
  ProcessedPsdData,
  CameraOptions,
} from "./types";

// Re-export types for external consumers
export type { DebugOptions, PluginOptions } from "./types";

export default class PsdToPhaser extends Phaser.Plugins.BasePlugin {
  private psdData: Record<string, ProcessedPsdData> = {};
  public options: PluginOptions;
  
  public load: ReturnType<typeof loadModule>;
  public place: ReturnType<typeof placeModule>;
  public getTexture: ReturnType<typeof getTextureModule>;
  public getMask: ReturnType<typeof getMaskModule>;
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
  "%c✨ PSD-to-Phaser v0.0.6 ✨",
  "background: black; color: white; padding: 1px 3px; border-radius: 2px;"
);
    this.load = loadModule(this);
    this.place = placeModule(this);
    this.getTexture = getTextureModule(this);
    this.getMask = getMaskModule(this);
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

  setData(key: string, data: ProcessedPsdData): void {
    this.psdData[key] = data;
    if (this.isDebugEnabled("console")) {
      console.log(`Data set for key "${key}":`, data);
    }
  }

  getData(key: string): ProcessedPsdData | undefined {
    return this.psdData[key];
  }

  /**
   * Get all registered PSD keys
   */
  getAllKeys(): string[] {
    return Object.keys(this.psdData);
  }

  isDebugEnabled(option: keyof DebugOptions): boolean {
    return (
      typeof this.options.debug === "object" && !!this.options.debug[option]
    );
  }
}
