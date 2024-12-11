// src/modules/cameras/features/draggable.ts

import PsdToPhaserPlugin from '../../../PsdToPhaserPlugin';

export interface DraggableOptions {
  useBounds?: { x: number; y: number; width: number; height: number };
  easeDragging?: boolean;
  friction?: number;
  minSpeed?: number;
}

export function DraggableCamera(_plugin: PsdToPhaserPlugin, camera: Phaser.Cameras.Scene2D.Camera, options: DraggableOptions = {}) {
  const scene = camera.scene;
  let isDragging = false;
  let lastPointer = new Phaser.Math.Vector2();
  let velocity = new Phaser.Math.Vector2();
  let dragStart = new Phaser.Math.Vector2();

  const defaultOptions: DraggableOptions = {
    easeDragging: false,
    friction: 0.95,
    minSpeed: 0.1
  };

  const config = { ...defaultOptions, ...options };

  function setupBounds() {
    if (config.useBounds) {
      if (typeof config.useBounds === "object") {
        console.log("using custom size");
        camera.setBounds(
          config.useBounds.x,
          config.useBounds.y,
          config.useBounds.width,
          config.useBounds.height
        );
      } else {
        console.warn("useBounds object must have {x, y, width, height} format");
      }
    }
  }

  function onDragStart(pointer: Phaser.Input.Pointer) {
    isDragging = true;
    dragStart.copy(pointer);
    lastPointer.copy(pointer);
    velocity.reset();
    scene.events.emit('draggableStart', camera);
  }

  function onDragMove(pointer: Phaser.Input.Pointer) {
    if (!isDragging) return;

    const dx = pointer.x - lastPointer.x;
    const dy = pointer.y - lastPointer.y;

    camera.scrollX -= dx / camera.zoom;
    camera.scrollY -= dy / camera.zoom;

    velocity.set(-dx, -dy);
    lastPointer.copy(pointer);

    scene.events.emit('draggableActive', camera);
  }

  function onDragEnd() {
    isDragging = false;
    if (!config.easeDragging) {
      velocity.reset();
    }
    scene.events.emit('draggableComplete', camera);
  }

  function update() {
    if (!isDragging && config.easeDragging) {
      if (velocity.length() > config.minSpeed!) {
        camera.scrollX += velocity.x / camera.zoom;
        camera.scrollY += velocity.y / camera.zoom;
        velocity.scale(config.friction!);
        scene.events.emit('draggableActive', camera);
      } else {
        velocity.reset();
      }
    }
  }

  function setupDragEvents() {
    scene.input.on('pointerdown', onDragStart);
    scene.input.on('pointermove', onDragMove);
    scene.input.on('pointerup', onDragEnd);
    scene.events.on('update', update);
  }

  setupDragEvents();
  setupBounds();

  return {
    isDragging: () => isDragging,
    getVelocity: () => velocity.clone(),
    setOptions: (newOptions: Partial<DraggableOptions>) => {
      Object.assign(config, newOptions);
      setupBounds();
      if (!config.easeDragging) {
        velocity.reset();
      }
    }
  };
}