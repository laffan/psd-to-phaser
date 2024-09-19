import PsdToPhaserPlugin from '../../../PsdToPhaserPlugin';

export interface PanToOptions {
  targetPositionY?: 'center' | 'top' | 'bottom';
  targetPositionX?: 'center' | 'left' | 'right';
  targetOffset?: [number, number];
  speed?: number;
  easing?: boolean | Phaser.Types.Math.EaseFunction;
}

export function panTo(plugin: PsdToPhaserPlugin, camera: Phaser.Cameras.Scene2D.Camera) {
  return function(target: Phaser.GameObjects.GameObject | [number, number], options: PanToOptions = {}) {
    const scene = camera.scene;
    const defaults: PanToOptions = {
      targetPositionY: 'center',
      targetPositionX: 'center',
      targetOffset: [0, 0],
      speed: 300,
      easing: true
    };

    const config = { ...defaults, ...options };

    let targetX: number, targetY: number;
    let targetWidth: number = 0, targetHeight: number = 0;

    if (Array.isArray(target)) {
      [targetX, targetY] = target;
    } else {
      targetX = target.x;
      targetY = target.y;
      targetWidth = (target as any).width || 0;
      targetHeight = (target as any).height || 0;
    }

    // Calculate the center point of the target
    targetX += targetWidth / 2;
    targetY += targetHeight / 2;

    // Apply target position adjustments
    switch (config.targetPositionX) {
      case 'left':
        targetX += camera.width / 2;
        break;
      case 'right':
        targetX -= camera.width / 2;
        break;
      case 'center':
      default:
        // No adjustment needed for center
        break;
    }

    switch (config.targetPositionY) {
      case 'top':
        targetY += camera.height / 2;
        break;
      case 'bottom':
        targetY -= camera.height / 2;
        break;
      case 'center':
      default:
        // No adjustment needed for center
        break;
    }

    // Apply offset
    targetX += config.targetOffset![0];
    targetY += config.targetOffset![1];

    // Calculate the final scroll position
    const scrollX = targetX - camera.width / 2;
    const scrollY = targetY - camera.height / 2;

    // Calculate the distance to pan
    const distanceX = scrollX - camera.scrollX;
    const distanceY = scrollY - camera.scrollY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    // Set up the pan animation
    const duration = config.speed!;
    let easingFunction: Phaser.Types.Math.EaseFunction = Phaser.Math.Easing.Linear;
    
    if (config.easing === true) {
      easingFunction = Phaser.Math.Easing.Cubic.InOut;
    } else if (typeof config.easing === 'function') {
      easingFunction = config.easing;
    }

    scene.events.emit('panToStart');

    scene.tweens.add({
      targets: camera,
      scrollX: scrollX,
      scrollY: scrollY,
      duration: duration,
      ease: easingFunction,
      onUpdate: () => {
        const progress = 1 - (camera.scrollX - scrollX) / distanceX;
        scene.events.emit('panToProgress', progress);
      },
      onComplete: () => {
        scene.events.emit('panToComplete');
      }
    });
  };
}