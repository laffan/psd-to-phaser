import { DraggableOptions } from "../typeDefinitions";

export class DraggableCamera {
  private camera: Phaser.Cameras.Scene2D.Camera;
  private config: DraggableOptions;
  private isDragging: boolean = false;
  private lastPointer: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
  private velocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
  private scene: Phaser.Scene;
  private dragStart: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

  constructor(
    camera: Phaser.Cameras.Scene2D.Camera,
    config: DraggableOptions = {}
  ) {
    this.camera = camera;
    this.scene = camera.scene;
    this.config = {
      easeDragging: false,
      friction: 0.95,
      minSpeed: 0.1,
      ...config,
    };

    this.setupDragEvents();
    this.setupBounds();
  }

  private setupDragEvents() {
    this.scene.input.on("pointerdown", this.onDragStart, this);
    this.scene.input.on("pointermove", this.onDragMove, this);
    this.scene.input.on("pointerup", this.onDragEnd, this);
    this.scene.events.on("update", this.update, this);
  }

  private setupBounds() {
    console.log( typeof this.config.useBounds );
    if (typeof this.config.useBounds  === "object") {
      console.log("using custom size")
      this.camera.setBounds(
        this.config.useBounds.x,
        this.config.useBounds.y,
        this.config.useBounds.width,
        this.config.useBounds.height
      );
    } else  {
      console.warn("useBounds object must have {x, y, width, height} format")
    }
  }

  private onDragStart = (pointer: Phaser.Input.Pointer) => {
    this.isDragging = true;
    this.dragStart.set(pointer.x, pointer.y);
    this.lastPointer.set(pointer.x, pointer.y);
    this.velocity.reset();
    this.scene.events.emit("dragOnStart", this.camera);
  };

  private onDragMove = (pointer: Phaser.Input.Pointer) => {
    if (!this.isDragging) return;

    const dx = pointer.x - this.lastPointer.x;
    const dy = pointer.y - this.lastPointer.y;

    this.camera.scrollX -= dx / this.camera.zoom;
    this.camera.scrollY -= dy / this.camera.zoom;
    this.velocity.set(-dx, -dy);
    this.lastPointer.set(pointer.x, pointer.y);

    this.scene.events.emit("isDragging", this.camera);
  };

  private onDragEnd = () => {
    this.isDragging = false;
    if (!this.config.easeDragging) {
      this.velocity.reset();
    }
    this.scene.events.emit("dragOnComplete", this.camera);
  };

  public update = () => {
    if (!this.isDragging && this.config.easeDragging) {
      this.easeDragging();
    }
  };

  private easeDragging() {
    if (this.velocity.length() > this.config.minSpeed!) {
      this.camera.scrollX += this.velocity.x / this.camera.zoom;
      this.camera.scrollY += this.velocity.y / this.camera.zoom;

      this.velocity.scale(this.config.friction!);
      this.scene.events.emit("isDragging", this.camera);
    } else {
      this.velocity.reset();
    }
  }

  public update = () => {
    if (!this.isDragging && this.config.easeDragging) {
      this.easeDragging();
    }
  };

  public updateConfig(config: Partial<DraggableOptions>) {
    Object.assign(this.config, config);
    this.setupBounds();
    if (!this.config.easeDragging) {
      this.velocity.reset(); // Reset velocity when turning off easing
    }
  }
}
