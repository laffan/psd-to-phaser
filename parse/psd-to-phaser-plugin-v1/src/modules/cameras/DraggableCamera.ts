import { DraggableOptions } from "../typeDefinitions";

export class DraggableCamera {
  private camera: Phaser.Cameras.Scene2D.Camera;
  private config: DraggableOptions;
  private isDragging: boolean = false;
  private lastPointer: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
  private velocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

  constructor(camera: Phaser.Cameras.Scene2D.Camera, config: DraggableOptions = {}) {
    this.camera = camera;
    this.config = config;

    this.setupDragEvents();
    this.setupBounds();
  }

  private setupDragEvents() {
    const scene = this.camera.scene;
    scene.input.on('pointerdown', this.onDragStart, this);
    scene.input.on('pointermove', this.onDragMove, this);
    scene.input.on('pointerup', this.onDragEnd, this);
    scene.events.on('update', this.update, this);
  }

  private setupBounds() {
    if (this.config.setBounds) {
      this.camera.setBounds(
        this.config.setBounds.x,
        this.config.setBounds.y,
        this.config.setBounds.width,
        this.config.setBounds.height
      );
    } else if (this.config.useBounds) {
      const { width, height } = this.camera.scene.sys.game.scale.gameSize;
      this.camera.setBounds(0, 0, width, height);
    }
  }

  private onDragStart(pointer: Phaser.Input.Pointer) {
    this.isDragging = true;
    this.lastPointer.set(pointer.x, pointer.y);
    this.velocity.reset();
    this.camera.emit('dragStart', this.camera);
  }

  private onDragMove(pointer: Phaser.Input.Pointer) {
    if (!this.isDragging) return;

    const dx = pointer.x - this.lastPointer.x;
    const dy = pointer.y - this.lastPointer.y;

    this.camera.scrollX -= dx / this.camera.zoom;
    this.camera.scrollY -= dy / this.camera.zoom;

    this.velocity.set(dx, dy);
    this.lastPointer.set(pointer.x, pointer.y);

    this.camera.emit('dragging', this.camera);
  }

  private onDragEnd() {
    this.isDragging = false;
    this.camera.emit('dragEnd', this.camera);
  }

  public update() {
    if (!this.isDragging && this.config.easeDragging) {
      const easeAmount = this.config.easeAmount || 0.05;
      this.camera.scrollX += this.velocity.x * easeAmount;
      this.camera.scrollY += this.velocity.y * easeAmount;
      this.velocity.scale(0.95);
    }
  }

  public updateConfig(config: Partial<DraggableOptions>) {
    Object.assign(this.config, config);
    this.setupBounds();
  }
}