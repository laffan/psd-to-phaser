import Phaser from "phaser";
import loadModule from "./modules/load/index";
import pointsModule from "./modules/layerTypes/points/index";
import zonesModule from "./modules/layerTypes/zones/index";
import tilesModule from "./modules/layerTypes/tiles/index";
import spritesModule from "./modules/layerTypes/sprites/index";
import camerasModule from "./modules/cameras/index"; // Add this line
import { StorageManager } from "./modules/core/StorageManager";

export interface DebugOptions {
  console?: boolean;
  shape?: boolean;
  label?: boolean;
}

export default class PsdToPhaserPlugin extends Phaser.Plugins.BasePlugin {
  private psdData: Record<string, any> = {};
  public storageManager: StorageManager;
  public options: { debug: boolean | DebugOptions } = { debug: false };
  public load: ReturnType<typeof loadModule>;
  public points: ReturnType<typeof pointsModule>;
  public zones: ReturnType<typeof zonesModule>;
  public tiles: ReturnType<typeof tilesModule>;
  public sprites: ReturnType<typeof spritesModule>;
  public cameras: ReturnType<typeof camerasModule>; // Add this line

  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);
    this.storageManager = new StorageManager();
    this.load = loadModule(this);
    this.points = pointsModule(this);
    this.zones = zonesModule(this);
    this.tiles = tilesModule(this);
    this.sprites = spritesModule(this);
    this.cameras = camerasModule(this); // Add this line
  }

  init(options: { debug?: boolean | DebugOptions } = {}): void {
    console.log("V34!");
    if (typeof options.debug === "boolean") {
      this.options.debug = options.debug
        ? { console: true, shape: true, label: true }
        : false;
    } else {
      this.options.debug = options.debug || false;
    }

    if (this.options.debug) {
      console.log("PsdToPhaserPlugin initialized with options:", this.options);
    }
  }

  setData(key: string, data: any): void {
    this.psdData[key] = data;
    if (this.options.debug) {
      console.log(`Data set for key "${key}":`, data);
      console.log("Current psdData:", this.psdData);
    }
  }

  getData(key: string): any {
    if (this.options.debug) {
      console.log(`Getting data for key "${key}"`);
      console.log("Current psdData:", this.psdData);
      console.log(`Data for key "${key}":`, this.psdData[key]);
    }
    if (!this.psdData[key]) {
      console.warn(
        `No data found for key "${key}". Available keys:`,
        Object.keys(this.psdData)
      );
    }
    return this.psdData[key];
  }
}