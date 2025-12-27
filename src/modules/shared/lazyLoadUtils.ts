// src/modules/shared/lazyLoadUtils.ts

import PsdToPhaserPlugin from '../../PsdToPhaser';
import type { PsdLayer, BaseLayer, CategorizedLayers } from '../../types';

type LayerCategoryKey = keyof CategorizedLayers;

export function checkIfLazyLoaded(plugin: PsdToPhaserPlugin, psdKey: string, layer: PsdLayer): boolean {
  const psdData = plugin.getData(psdKey);
  if (!psdData || !psdData.lazyLoad) return false;

  // Map category to plural form used in CategorizedLayers
  const categoryMap: Record<string, LayerCategoryKey> = {
    sprite: 'sprites',
    tileset: 'tiles',
    zone: 'zones',
    point: 'points',
    group: 'groups',
  };

  const categoryKey = categoryMap[layer.category];
  if (!categoryKey) return false;

  const lazyLoadCategory = psdData.lazyLoad[categoryKey];
  if (!lazyLoadCategory) return false;

  return lazyLoadCategory.some((lazyLayer) => lazyLayer.name === layer.name);
}

export function createLazyLoadPlaceholder(
  scene: Phaser.Scene,
  layerData: BaseLayer,
  plugin: PsdToPhaserPlugin
): Phaser.GameObjects.Container {
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

