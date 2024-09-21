import PsdToPhaserPlugin from '../../../../PsdToPhaserPlugin';
import { placeDefaultSprite } from './default';
import { placeSpritesheet } from './spritesheet';
import { placeAtlas } from './atlas';
import { placeAnimation } from './animation';
import { createLazyLoadPlaceholder } from '../../../shared/lazyLoadUtils';

export function placeSprites(
  scene: Phaser.Scene,
  spriteData: any,
  plugin: PsdToPhaserPlugin,
  group: Phaser.GameObjects.Group,
  resolve: () => void,
  psdKey: string
): void {
  if (spriteData.lazyLoad) {
    const placeholder = createLazyLoadPlaceholder(scene, spriteData, plugin);
    if (placeholder) group.add(placeholder);
    resolve();
    return;
  }

  if (scene.textures.exists(spriteData.name)) {
    let spriteObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Group | null = null;

    switch (spriteData.type) {
      case 'spritesheet':
        spriteObject = placeSpritesheet(scene, spriteData, plugin, psdKey);
        break;
      case 'atlas':
        spriteObject = placeAtlas(scene, spriteData, plugin, psdKey);
        break;
      case 'animation':
        spriteObject = placeAnimation(scene, spriteData, plugin, psdKey);
        break;
      default:
        spriteObject = placeDefaultSprite(scene, spriteData, plugin, psdKey);
        break;
    }

    if (spriteObject) {
      group.add(spriteObject);
      if (spriteData.alpha !== undefined) spriteObject.setAlpha(spriteData.alpha);
      if (spriteData.visible !== undefined) spriteObject.setVisible(spriteData.visible);
      spriteObject.setDepth(spriteData.initialDepth || 0);
      addDebugVisualization(scene, spriteData, group, plugin);
    } else {
      console.error(`Failed to place sprite: ${spriteData.name}`);
    }
  } else {
    console.warn(`Texture not found for sprite: ${spriteData.name}`);
  }

  resolve();
}

function addDebugVisualization(
  scene: Phaser.Scene,
  spriteData: any,
  group: Phaser.GameObjects.Group,
  plugin: PsdToPhaserPlugin
): void {
  const debugDepth = 1000;

  if (plugin.isDebugEnabled('shape')) {
    const graphics = scene.add.graphics();
    graphics.setDepth(debugDepth);
    graphics.lineStyle(2, 0x00ff00, 1);
    graphics.strokeRect(spriteData.x, spriteData.y, spriteData.width, spriteData.height);
    group.add(graphics);
  }

  if (plugin.isDebugEnabled('label')) {
    const text = scene.add.text(spriteData.x, spriteData.y - 20, spriteData.name, {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#ffffff'
    });
    text.setDepth(debugDepth);
    group.add(text);
  }
}