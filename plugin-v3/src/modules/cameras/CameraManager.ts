import PsdToPhaserPlugin from "../../PsdToPhaserPlugin";
import {
  CameraConfig,
  LazyLoadingOptions,
  DraggableOptions,
  PanOptions,
  DebugOptions,
} from "../typeDefinitions";
import { LazyLoadCamera } from "./LazyLoadCamera";
import { DraggableCamera } from "./DraggableCamera";

export class CameraManager {
  private plugin: PsdToPhaserPlugin;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private lazyLoading: LazyLoadCamera | null = null;
  private draggable: DraggableCamera | null = null;
  private debugGraphics: Phaser.GameObjects.Graphics | null = null;
  private psdKey: string;

  constructor(
    plugin: PsdToPhaserPlugin,
    camera: Phaser.Cameras.Scene2D.Camera,
    features: string[],
    psdKey: string,
    config: CameraConfig
  ) {
    this.plugin = plugin;
    this.camera = camera;
    this.psdKey = psdKey;

    features.forEach((feature) => {
      switch (feature) {
        case "lazyLoading":
          this.lazyLoading = new LazyLoadCamera(
            plugin,
            camera,
            psdKey,
            config.lazyLoadingOptions
          );
          break;
        case "draggable":
          this.draggable = new DraggableCamera(camera, config.draggableOptions);
          break;
        // Add other features here as they are implemented
      }
    });

    this.setupDebug(config.debug);

    // Trigger initial lazy load
    this.camera.centerOn(this.camera.midPoint.x, this.camera.midPoint.y);
    this.triggerInitialLazyLoad();
  }

  private setupDebug(debugOptions?: DebugOptions) {
    if (debugOptions) {
      const scene = this.camera.scene;
      this.debugGraphics = scene.add.graphics();

      if (debugOptions.label) {
        const cameraName = `Camera (${this.camera.x}, ${this.camera.y})`;
        scene.add
          .text(10, 10, cameraName, { fontSize: "16px", color: "#ffffff" })
          .setScrollFactor(0)
          .setDepth(1000);
      }

      if (debugOptions.shape) {
        this.updateDebugShape();
        this.camera.on("resize", this.updateDebugShape, this);
      }

      if (debugOptions.console) {
        console.log("Camera:", this.camera);
      }
    }
  }

  private updateDebugShape() {
    if (this.debugGraphics) {
      this.debugGraphics.clear();
      this.debugGraphics.lineStyle(2, 0x00ff00, 1);
      this.debugGraphics.strokeRect(
        this.camera.x,
        this.camera.y,
        this.camera.width,
        this.camera.height
      );
    }
  }

  private triggerInitialLazyLoad() {
    if (this.lazyLoading) {
      // Force an immediate update
      this.lazyLoading.forceUpdate();
    }
  }

  public update(config: Partial<CameraConfig>) {
    if (config.lazyLoadingOptions && this.lazyLoading) {
      this.lazyLoading.updateConfig(config.lazyLoadingOptions);
    }
    if (config.draggableOptions && this.draggable) {
      this.draggable.update();
    }
    // Update other features as they are implemented
  }

  public updateConfig(config: Partial<CameraConfig>) {
    if (config.draggableOptions && this.draggable) {
      this.draggable.updateConfig(config.draggableOptions);
    }
    // Update other features as they are implemented
  }

  public panToPoint(
    psdKey: string,
    pointPath: string,
    options: PanOptions = {}
  ) {
    const point = this.plugin.points.get(psdKey, pointPath);
    if (!point) {
      console.error(`Point not found: ${pointPath}`);
      return;
    }

    const targetX = point.x;
    const targetY = point.y;

    let x = targetX;
    let y = targetY;

    if (options.pointPlacement === "center") {
      x = targetX - this.camera.width / 2;
      y = targetY - this.camera.height / 2;
    } else if (Array.isArray(options.pointPlacement)) {
      x = targetX - options.pointPlacement[0];
      y = targetY - options.pointPlacement[1];
    }

    const duration = options.speed || 1000;
    const ease = options.easing ? "Cubic.easeInOut" : "Linear";

    // Use Phaser's built-in camera pan method
    this.camera.pan(x, y, duration, ease);

    // Emit an event when the pan starts
    this.camera.emit("panStart", this.camera);

    // Set up a one-time event listener for when the pan completes
    this.camera.once("cameraPanComplete", () => {
      this.camera.emit("panComplete", this.camera);
    });
  }
}