// src/modules/lazyLoad/utils.ts

import PsdToPhaserPlugin from '../../PsdToPhaser';


export function checkIfLazyLoaded(plugin: PsdToPhaserPlugin, psdKey: string, layer: any): boolean {
  const psdData = plugin.getData(psdKey);
  if (!psdData || !psdData.lazyLoad) return false;

  const lazyLoadCategory = psdData.lazyLoad[layer.category + 's']; // e.g., 'sprites', 'tiles'
  if (!lazyLoadCategory) return false;

  return lazyLoadCategory.some((lazyLayer: any) => lazyLayer.name === layer.name);
}

// src/modules/lazyLoad/utils.ts

export function createLazyLoadPlaceholder(scene: Phaser.Scene, layerData: any, plugin: PsdToPhaserPlugin): Phaser.GameObjects.Container {
  const container = scene.add.container(layerData.x, layerData.y);

  if (plugin.isDebugEnabled('shape')) {
    const graphics = scene.add.graphics();
    graphics.lineStyle(2, 0xff00ff, 1);
    graphics.strokeRect(0, 0, layerData.width, layerData.height);
    container.add(graphics);
  }

  if (plugin.isDebugEnabled('label')) {
    const text = scene.add.text(0, -20, `${layerData.name} (Lazy)`, {
      fontSize: '16px',
      color: '#ff00ff',
      backgroundColor: '#ffffff'
    });
    container.add(text);
  }

  return container;
}

