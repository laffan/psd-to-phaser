/**
 * Sprite placement router – dispatches to the correct handler based on
 * sprite type (default, atlas, spritesheet, animation).
 *
 * @module place/types/sprites
 */

import PsdToPhaserPlugin from "../../../../PsdToPhaser";
import { placeDefaultSprite } from "./default";
import { placeSpritesheet } from "./spritesheet";
import { placeAtlas } from "./atlas";
import { placeAnimation } from "./animation";
import { createLazyLoadPlaceholder } from "../../../shared/lazyLoadUtils";
import { addDebugVisualization } from "../../../shared/debugVisualizer";

import type { SpriteLayer } from "../../../../types";

/**
 * Place a sprite layer, routing to the appropriate handler by type.
 *
 * Handles lazy-load skipping, texture-key namespacing (for `loadMultiple`),
 * alpha/visibility/depth from PSD attributes, and debug visualisation.
 *
 * @param scene - The Phaser scene
 * @param spriteData - The sprite layer definition
 * @param plugin - Plugin instance
 * @param group - Parent group to add the sprite to
 * @param resolve - Callback to signal placement is complete
 * @param psdKey - PSD key for namespace resolution
 * @param animationOptions - Optional animation overrides (for animation sprites)
 *
 * @internal
 */
export function placeSprites(
  scene: Phaser.Scene,
  spriteData: SpriteLayer,
  plugin: PsdToPhaserPlugin,
  group: Phaser.GameObjects.Group,
  resolve: () => void,
  psdKey: string,
  animationOptions?: Phaser.Types.Animations.Animation
): void {
  if (spriteData.lazyLoad) {
    const placeholder = createLazyLoadPlaceholder(scene, spriteData, plugin);
    if (placeholder) group.add(placeholder);
    resolve();
    return;
  }

  // Check if this PSD was loaded via loadMultiple and use namespaced texture key
  const plugin_data = plugin.getData(psdKey);
  const textureKey = plugin_data?.isMultiplePsd ? `${psdKey}_${spriteData.name}` : spriteData.name;

  if (scene.textures.exists(textureKey)) {
    let spriteObject:
      | Phaser.GameObjects.Sprite
      | Phaser.GameObjects.Group
      | null = null;

    switch (spriteData.type) {
      case "spritesheet":
        spriteObject = placeSpritesheet(scene, spriteData, plugin, psdKey, textureKey);
        break;
      case "atlas":
        spriteObject = placeAtlas(scene, spriteData, plugin, psdKey, textureKey);
        break;
      case "animation":
        spriteObject = placeAnimation(scene, spriteData, plugin, psdKey, textureKey, animationOptions);
        break;
      default:
        spriteObject = placeDefaultSprite(scene, spriteData, plugin, psdKey, textureKey);
        break;
    }

    if (spriteObject) {
      if (spriteObject instanceof Phaser.GameObjects.Group) {
        spriteObject.getChildren().forEach((child) => {
          group.add(child);
        });
      } else {
        group.add(spriteObject);
      }
      if (spriteData.alpha !== undefined)
        spriteObject.setAlpha(spriteData.alpha);
      if (spriteData.hidden !== undefined) spriteObject.setVisible(false);
      spriteObject.setDepth(spriteData.initialDepth || 0);

      // Create a separate debug group
      const debugGroup = scene.add.group();
      addDebugVisualization(scene, plugin, debugGroup, {
        type: 'sprite',
        name: spriteData.name,
        x: spriteData.x,
        y: spriteData.y,
        width: spriteData.width,
        height: spriteData.height,
      });
      // Add the debug group as a child of the main group, but don't include it in the group's children array
      (group as any).debugGroup = debugGroup;
    } else {
      console.error(`Failed to place sprite: ${spriteData.name}`);
    }
  } else {
    console.warn(`Texture not found for sprite: ${spriteData.name} (looking for texture key: ${textureKey})`);
  }

  resolve();
}
