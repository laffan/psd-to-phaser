/**
 * Draggable camera feature – enables click-and-drag panning with
 * optional inertia/easing, bounds constraints, and object ignoring.
 *
 * Emits the following events on the scene:
 * - `"draggableStart"` – drag begins
 * - `"draggableActive"` – camera is being dragged (or easing)
 * - `"draggableComplete"` – drag ends
 *
 * @module cameras/features/draggable
 *
 * @example
 * ```js
 * const cam = this.P2P.createCamera(this.cameras.main, ['draggable'], {
 *   draggable: {
 *     useBounds: { x: 0, y: 0, width: 1000, height: 1000 },
 *     easeDragging: true,
 *     friction: 0.95,
 *     minSpeed: 0.1,
 *     ignore: ["ui/buttons", "draggableSprite"],
 *   },
 * });
 *
 * // Pause/resume
 * cam.pause();
 * cam.resume();
 * ```
 */

import PsdToPhaserPlugin from '../../../PsdToPhaser';

/**
 * Configuration options for the draggable camera feature.
 */
export interface DraggableOptions {
  /** Rectangular bounds to constrain camera scrolling */
  useBounds?: { x: number; y: number; width: number; height: number };
  /** Enable momentum/inertia after releasing the drag */
  easeDragging?: boolean;
  /** Friction factor applied to velocity each frame when easing (0–1) */
  friction?: number;
  /** Minimum velocity threshold below which easing stops */
  minSpeed?: number;
  /** Paths of interactive objects to ignore when starting a drag */
  ignore?: string[];
}

/**
 * Create the draggable camera feature.
 *
 * Returns an object with `pause()`, `resume()`, `isPaused()`,
 * `isDragging()`, `getVelocity()`, and `setOptions()` methods
 * that are mixed into the camera.
 *
 * @param _plugin - Plugin instance (unused, reserved)
 * @param camera - The Phaser camera to make draggable
 * @param options - Draggable configuration
 * @returns Methods to mix into the camera
 *
 * @internal
 */
export function DraggableCamera(_plugin: PsdToPhaserPlugin, camera: Phaser.Cameras.Scene2D.Camera, options: DraggableOptions = {}) {
  const scene = camera.scene;
  let isDragging = false;
  let isPaused = false;
  let lastPointer = new Phaser.Math.Vector2();
  let velocity = new Phaser.Math.Vector2();
  let dragStart = new Phaser.Math.Vector2();

  const defaultOptions: DraggableOptions = {
    easeDragging: false,
    friction: 0.95,
    minSpeed: 0.1,
    ignore: []
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

  /**
   * Get the full path of a game object by traversing up through parent groups
   */
  function getObjectPath(obj: Phaser.GameObjects.GameObject): string {
    const parts: string[] = [];
    let current: any = obj;

    while (current) {
      if (current.name) {
        parts.unshift(current.name);
      }
      // Try to find parent group - check if this object is in a group
      current = current.parentContainer || null;
    }

    return parts.join('/');
  }

  /**
   * Check if the given object matches any of the ignore paths
   * Supports partial path matching (e.g., "button" matches "ui/button/icon")
   */
  function isIgnoredObject(obj: Phaser.GameObjects.GameObject): boolean {
    if (!config.ignore || config.ignore.length === 0) {
      return false;
    }

    const objectPath = getObjectPath(obj);
    const objectName = obj.name || '';

    for (const ignorePath of config.ignore) {
      // Exact match on object name
      if (objectName === ignorePath) {
        return true;
      }
      // Full path contains the ignore path
      if (objectPath === ignorePath) {
        return true;
      }
      // Path ends with the ignore path (e.g., ignorePath "btn" matches "ui/group/btn")
      if (objectPath.endsWith('/' + ignorePath)) {
        return true;
      }
      // Path starts with ignore path (e.g., ignorePath "ui/buttons" matches "ui/buttons/ok")
      if (objectPath.startsWith(ignorePath + '/') || objectPath === ignorePath) {
        return true;
      }
      // Object path contains ignore path as a segment
      if (objectPath.includes('/' + ignorePath + '/')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if the pointer is over any ignored objects
   */
  function isPointerOverIgnoredObject(pointer: Phaser.Input.Pointer): boolean {
    if (!config.ignore || config.ignore.length === 0) {
      return false;
    }

    // Get all interactive objects under the pointer
    const hitObjects = scene.input.hitTestPointer(pointer);

    for (const obj of hitObjects) {
      if (isIgnoredObject(obj)) {
        return true;
      }
    }

    return false;
  }

  function onDragStart(pointer: Phaser.Input.Pointer) {
    // Don't start dragging if paused or pointer is over an ignored object
    if (isPaused || isPointerOverIgnoredObject(pointer)) {
      return;
    }

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
    isPaused: () => isPaused,
    getVelocity: () => velocity.clone(),
    setOptions: (newOptions: Partial<DraggableOptions>) => {
      Object.assign(config, newOptions);
      setupBounds();
      if (!config.easeDragging) {
        velocity.reset();
      }
    },
    pause: () => {
      isPaused = true;
      // Stop any current drag operation
      if (isDragging) {
        isDragging = false;
        velocity.reset();
        scene.events.emit('draggableComplete', camera);
      }
    },
    resume: () => {
      isPaused = false;
    }
  };
}