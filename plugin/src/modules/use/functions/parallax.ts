import PsdToPhaserPlugin from '../../../PsdToPhaserPlugin';

export interface ParallaxOptions {
  camera?: Phaser.Cameras.Scene2D.Camera | string;
  target: Phaser.GameObjects.GameObject;
  scrollFactor?: number;
}

export function parallax(_plugin: PsdToPhaserPlugin) {
  return function (options: ParallaxOptions) {
    const {
      camera: cameraOrName,
      target,
      scrollFactor = 0.25,
    } = options;

    if (!target) {
      console.warn('[P2P parallax] No valid "target" was provided.');
      return;
    }

    let camera: Phaser.Cameras.Scene2D.Camera | undefined;
    let scene: Phaser.Scene | undefined;

    if (typeof cameraOrName === 'string') {
      scene = target.scene;
      if (!scene) {
        console.warn(`[P2P parallax] Could not resolve scene from target for camera "${cameraOrName}".`);
        return;
      }

      camera = scene.cameras.getCamera(cameraOrName) as Phaser.Cameras.Scene2D.Camera;
      if (!camera) {
        camera = scene.cameras.main;
      }

    } else if (cameraOrName instanceof Phaser.Cameras.Scene2D.Camera) {
      // b) If we got an actual camera object
      camera = cameraOrName;
      scene = camera.scene;

    } else {
      scene = target.scene;
      if (!scene) {
        console.warn('[P2P parallax] Could not find scene from target to use a default camera.');
        return;
      }
      camera = scene.cameras.main;
    }

    if (!camera) {
      console.warn('[P2P parallax] Could not resolve a valid camera.');
      return;
    }
    if (!scene) {
      console.warn('[P2P parallax] Could not resolve a valid scene.');
      return;
    }

    const sysAny = scene.sys as any; // so we can attach custom property
    if (!sysAny._parallaxItems) {
      sysAny._parallaxItems = [];

      scene.events.on('update', () => {
        const items = sysAny._parallaxItems || [];
        for (const item of items) {
          // Adjust position based on camera scroll
          item.target.x = item.initX + item.camera.scrollX * item.factor;
          item.target.y = item.initY + item.camera.scrollY * item.factor;
        }
      });
    }

    sysAny._parallaxItems.push({
      target,
      camera,
      factor: scrollFactor,
      initX: target.x,
      initY: target.y,
    });
  };
}