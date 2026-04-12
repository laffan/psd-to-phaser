/**
 * Lazy-load utilities – helpers for determining whether a layer should be
 * deferred and for creating debug placeholders in its place.
 *
 * @module shared/lazyLoadUtils
 */

import PsdToPhaserPlugin from '../../PsdToPhaser';
import type { PsdLayer, BaseLayer, CategorizedLayers } from '../../types';

type LayerCategoryKey = keyof CategorizedLayers;

/**
 * Determine whether a layer was categorised as lazy-loaded during
 * JSON processing.
 *
 * Checks the plugin's `lazyLoad` bucket for the PSD key to see if
 * the layer's name appears in the matching category array.
 *
 * @param plugin - Plugin instance
 * @param psdKey - PSD key
 * @param layer - The layer to check
 * @returns `true` if the layer is in the lazy-load bucket
 *
 * @internal
 */
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

/**
 * Create a placeholder Container for a lazy-loaded layer.
 *
 * When debug mode is enabled, draws a magenta outline and label so
 * developers can see where deferred assets will eventually appear.
 *
 * @param scene - The Phaser scene
 * @param layerData - Base layer data (position, size, name)
 * @param plugin - Plugin instance (for debug settings)
 * @returns A Container positioned at the layer's coordinates
 *
 * @internal
 */
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

