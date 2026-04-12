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

/**
 * Main plugin class for psd-to-phaser.
 *
 * Register as a global Phaser plugin to gain access to PSD loading, placement,
 * texture retrieval, mask handling, camera features, and interaction presets.
 *
 * @example
 * ```js
 * new Phaser.Game({
 *   plugins: {
 *     global: [{
 *       key: "PsdToPhaser",
 *       plugin: PsdToPhaser,
 *       start: true,
 *       mapping: "P2P",
 *       data: {
 *         debug: { shape: false, label: false, console: false },
 *         applyAlphaAll: false,
 *         applyBlendModesAll: false,
 *       },
 *     }],
 *   },
 * });
 * ```
 */
export default class PsdToPhaser extends Phaser.Plugins.BasePlugin {
  /** Internal store of processed PSD data, keyed by the user-supplied PSD key. */
  private psdData: Record<string, ProcessedPsdData> = {};

  /** Plugin-wide configuration options set during {@link init}. */
  public options: PluginOptions;

  /**
   * Load PSD manifests and their assets.
   *
   * @see {@link loadModule} for `load()` and `loadMultiple()` signatures.
   */
  public load: ReturnType<typeof loadModule>;

  /**
   * Place loaded layers into a scene, preserving PSD structure and depth.
   *
   * @see {@link placeModule} for the `place()` signature.
   */
  public place: ReturnType<typeof placeModule>;

  /**
   * Retrieve a Phaser texture for a loaded sprite by path.
   *
   * @see {@link getTextureModule}
   */
  public getTexture: ReturnType<typeof getTextureModule>;

  /**
   * Retrieve a mask image for a layer that has a PSD mask defined.
   *
   * @see {@link getMaskModule}
   */
  public getMask: ReturnType<typeof getMaskModule>;

  /**
   * Built-in interaction presets: button, fillZone, joystick, panTo, parallax.
   *
   * @see {@link useModule}
   */
  public use: ReturnType<typeof useModule>;

  /**
   * Create an enhanced camera with draggable and/or lazyLoad features.
   *
   * @see {@link createCamera}
   */
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
    this.use = useModule(this);
    this.createCamera = (
      camera: Phaser.Cameras.Scene2D.Camera,
      features: string[],
      options?: CameraOptions
    ) => createCamera(this, camera, features, options);

  }

  /**
   * Initialise plugin options. Called automatically by Phaser when the plugin
   * starts, using the `data` object from the plugin config.
   *
   * Accepts a boolean or granular `{ shape, label, console }` object for debug.
   * When `true`, all three debug channels are enabled.
   *
   * @param options - Plugin-wide configuration
   */
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

  /**
   * Store processed PSD data under the given key.
   *
   * @param key - Unique identifier for this PSD (same key passed to `load()`)
   * @param data - The fully processed PSD data
   *
   * @internal
   */
  setData(key: string, data: ProcessedPsdData): void {
    this.psdData[key] = data;
    if (this.isDebugEnabled("console")) {
      console.log(`Data set for key "${key}":`, data);
    }
  }

  /**
   * Retrieve the processed data for a previously loaded PSD.
   *
   * The returned object contains:
   * - `basePath` – folder where assets reside
   * - `original` – the full JSON manifest
   * - `initialLoad` – layers loaded immediately
   * - `lazyLoad` – layers deferred for lazy loading
   * - `positionOffset` – offset applied via `loadMultiple()`
   *
   * @param key - The PSD key used during `load()` or `loadMultiple()`
   * @returns The processed data, or `undefined` if the key is unknown
   *
   * @example
   * ```js
   * const psdData = this.P2P.getData("psd_key");
   * const psdWidth = psdData.original.width;
   * ```
   */
  getData(key: string): ProcessedPsdData | undefined {
    return this.psdData[key];
  }

  /**
   * Get all registered PSD keys.
   *
   * @returns Array of string keys for every PSD that has been loaded
   */
  getAllKeys(): string[] {
    return Object.keys(this.psdData);
  }

  /**
   * Check whether a specific debug channel is enabled.
   *
   * @param option - The debug channel to check: `"shape"`, `"label"`, or `"console"`
   * @returns `true` if the channel is active
   *
   * @internal
   */
  isDebugEnabled(option: keyof DebugOptions): boolean {
    return (
      typeof this.options.debug === "object" && !!this.options.debug[option]
    );
  }
}
