import { StoredObject } from "../../core/StoredObject";
import { SpriteData } from "../../types";
import { placeSprite as placeSimpleSprite } from "./defaultSprite";
// import { placeAnimation } from "./animation";
import { placeSpritesheetOrAnimation } from "./spritesheet";
import { placeAtlas } from "./atlas";

export function placeSprite(
  plugin: any,
  scene: Phaser.Scene,
  psdKey: string,
  spritePath: string,
  options: any = {}
): Phaser.GameObjects.GameObject | Phaser.GameObjects.Container | null {
  const psdData = plugin.getData(psdKey);
  if (!psdData || !psdData.sprites) {
    console.warn(`Sprite data not found for key '${psdKey}'.`);
    return null;
  }

  const sprite = findSpriteByPath(psdData.sprites, spritePath);
  if (!sprite) {
    console.warn(`Sprite '${spritePath}' not found in PSD data.`);
    return null;
  }

  if (sprite.children) {
    return placeNestedSprites(plugin, scene, psdKey, sprite, options);
  }

  return placeSingleSprite(plugin, scene, psdKey, sprite, spritePath, options);
}

export function placeAllSprites(
  plugin: any,
  scene: Phaser.Scene,
  psdKey: string,
  options: any = {}
): Phaser.GameObjects.GameObject[] {
  const psdData = plugin.getData(psdKey);
  if (!psdData || !psdData.sprites) {
    console.warn(`Sprite data not found for key '${psdKey}'.`);
    return [];
  }

  const placedSprites: Phaser.GameObjects.GameObject[] = [];

  psdData.sprites.forEach((sprite: SpriteData) => {
    const placedSprite = placeSprite(plugin, scene, psdKey, sprite.name, options);
    if (placedSprite) {
      placedSprites.push(placedSprite);
    }
  });
  

  return placedSprites;
}
function placeSingleSprite(
  plugin: any,
  scene: Phaser.Scene,
  psdKey: string,
  sprite: SpriteData,
  spritePath: string,
  options: any
): Phaser.GameObjects.GameObject | null {
  let placedSprite: Phaser.GameObjects.GameObject | null = null;
  
  try {
    switch (sprite.type) {
      case "atlas":
        placedSprite = placeAtlas(scene, sprite, options, psdKey);
        break;
      case "spritesheet":
        placedSprite = placeSpritesheet(scene, sprite, options, sprite.name);
        break;
      case "animation":
        placedSprite = placeAnimation(scene, sprite, options, sprite.name);
        break;
      case "merged":
      case "simple":
      default:
        placedSprite = placeSimpleSprite(scene, sprite, options, psdKey);
        break;
    }

    if (placedSprite) {
      storeSprite(plugin, psdKey, spritePath, placedSprite);
    }
  } catch (error) {
    console.error(`Error placing sprite ${spritePath}:`, error);
  }

  return placedSprite;
}

function placeNestedSprites(
  plugin: any,
  scene: Phaser.Scene,
  psdKey: string,
  parentSprite: SpriteData,
  options: any
): Phaser.GameObjects.Container {
  const container = scene.add.container(parentSprite.x, parentSprite.y);
  container.setName(`${psdKey}/${parentSprite.name}`);

  parentSprite.children.forEach((childSprite: SpriteData) => {
    const childPath = `${parentSprite.name}/${childSprite.name}`;
    const placedChild = placeSingleSprite(plugin, scene, psdKey, childSprite, childPath, options);
    if (placedChild) {
      container.add(placedChild);
    }
  });

  storeSprite(plugin, psdKey, parentSprite.name, container);
  return container;
}

function findSpriteByPath(sprites: SpriteData[], path: string): SpriteData | null {
  const parts = path.split("/");
  let current: SpriteData | undefined = sprites.find((s) => s.name === parts[0]);

  for (let i = 1; i < parts.length; i++) {
    if (!current || !current.children) return null;
    current = current.children.find((child) => child.name === parts[i]);
  }

  return current || null;
}

function storeSprite(plugin: any, psdKey: string, spritePath: string, sprite: Phaser.GameObjects.GameObject): void {
  if (!plugin.placedSprites) {
    plugin.placedSprites = {};
  }
  if (!plugin.placedSprites[psdKey]) {
    plugin.placedSprites[psdKey] = {};
  }
  plugin.placedSprites[psdKey][spritePath] = sprite;
}