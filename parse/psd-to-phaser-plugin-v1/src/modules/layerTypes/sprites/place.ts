import PsdToPhaserPlugin from "../../../PsdToPhaserPlugin";
import { SpriteData, WrappedObject } from "../../typeDefinitions";
import { placeSprite as placeSimpleSprite } from "./defaultSprite";
import { placeAnimation, updateAnimation } from "./animation";
import { placeSpritesheet } from "./spritesheet";
import { placeAtlas } from "./atlas";
import { createDebugShape } from "../../utils/debugVisualizer";
import { getDebugOptions } from "../../utils/sharedUtils";
import { createRemoveFunction } from "../../core/RemoveFunction";
import { StorageManager } from "../../core/StorageManager";

export function placeSprite(
  plugin: PsdToPhaserPlugin,
  scene: Phaser.Scene,
  psdKey: string,
  spritePath: string,
  options: any = {}
): WrappedObject | null {
  const psdData = plugin.getData(psdKey);
  if (!psdData) {
    console.error(`PSD data for key '${psdKey}' not found.`);
    return null;
  }

  const sprite = getSpriteByPath(psdData.sprites, spritePath);
  if (!sprite) {
    console.error(`Sprite '${spritePath}' not found in PSD data.`);
    return null;
  }

  const depth = options.depth !== undefined ? options.depth : Infinity;
  const parentPath = spritePath.split("/").slice(0, -1).join("/");
  const placedSprite = placeSpritesRecursively(
    scene,
    [sprite],
    options,
    depth,
    psdKey,
    parentPath,
    plugin.storageManager
  );

  // Store the placed sprite
  plugin.storageManager.store(psdKey, spritePath, placedSprite);

  return placedSprite;
}

export function placeAllSprites(
  plugin: PsdToPhaserPlugin,
  scene: Phaser.Scene,
  psdKey: string,
  options: any = {}
): Phaser.GameObjects.Container | null {
  const psdData = plugin.getData(psdKey);
  if (!psdData) {
    console.error(`PSD data for key '${psdKey}' not found.`);
    return null;
  }

  const depth = options.depth !== undefined ? options.depth : Infinity;
  const wrappedObject = placeSpritesRecursively(
    scene,
    psdData.sprites,
    options,
    depth,
    psdKey,
    "",
    plugin.storageManager
  );

  // Add the main container to the scene
  scene.add.existing(wrappedObject.placed);

  // Store the wrapped object
  plugin.storageManager.store(psdKey, "", wrappedObject);

  return wrappedObject.placed as Phaser.GameObjects.Container;
}

function placeSpritesRecursively(
  scene: Phaser.Scene,
  sprites: SpriteData[],
  options: any = {},
  depth: number,
  psdKey: string,
  parentPath: string = "",
  storageManager: StorageManager
): WrappedObject {
  const container = scene.add.container(0, 0);
  const children: WrappedObject[] = [];

  console.log(
    `Placing sprites recursively. Parent path: ${parentPath}, Depth: ${depth}`
  );

  sprites.forEach((sprite) => {
    const fullPath = parentPath ? `${parentPath}/${sprite.name}` : sprite.name;
    let spriteObject: WrappedObject | null = null;

    if (!sprite.children) {
      spriteObject = placeSingleSprite(
        scene,
        sprite,
        options,
        fullPath,
        psdKey,
        storageManager
      );

      if (spriteObject) {
        container.add(spriteObject.placed);
        addDebugVisualization(scene, sprite, spriteObject.placed, options);
        children.push(spriteObject);
        storageManager.store(psdKey, fullPath, spriteObject);
        console.log(`Stored sprite ${fullPath} in storage manager`);
      }
    }

    if (sprite.children && depth > 0) {
      const childWrappedObject = placeSpritesRecursively(
        scene,
        sprite.children,
        options,
        depth - 1,
        psdKey,
        fullPath,
        storageManager
      );
      container.add(childWrappedObject.placed);
      children.push(childWrappedObject);
      storageManager.store(psdKey, fullPath, childWrappedObject);
      console.log(`Stored nested sprites for ${fullPath} in storage manager`);
    }
  });

  if (sprites[0] && sprites[0].layerOrder !== undefined) {
    console.log(`Set depth of ${parentPath} to ${sprites[0].layerOrder}`);
    container.setDepth(sprites[0].layerOrder);
  }

  const wrappedContainer: WrappedObject = {
    name: parentPath.split("/").pop() || "",
    type: "Container",
    placed: container,
    children: children,
    remove: createRemoveFunction(storageManager, psdKey, parentPath),
    setPosition: (x: number, y: number) => container.setPosition(x, y),
    setAlpha: (alpha: number) => container.setAlpha(alpha),
    ...getCustomAttributes(sprites[0]),
  };

  storageManager.store(psdKey, parentPath, wrappedContainer);
  console.log(`Stored container for ${parentPath} in storage manager`);

  return wrappedContainer;
}

function placeSingleSprite(
  scene: Phaser.Scene,
  sprite: SpriteData,
  options: any,
  fullPath: string,
  psdKey: string,
  storageManager: StorageManager
): WrappedObject | null {
  let spriteObject:
    | Phaser.GameObjects.Sprite
    | Phaser.GameObjects.Container
    | null = null;

  try {
    switch (sprite.type) {
      case "atlas":
        spriteObject = placeAtlas(scene, sprite, options, fullPath);
        break;
      case "spritesheet":
        spriteObject = placeSpritesheet(scene, sprite, options, fullPath);
        break;
      case "animation":
        spriteObject = placeAnimation(scene, sprite, options, fullPath);
        break;
      case "merged":
      case "simple":
      default:
        spriteObject = placeSimpleSprite(scene, sprite, options, fullPath);
        break;
    }

    if (spriteObject) {
      spriteObject.setPosition(sprite.x, sprite.y);
      if (sprite.alpha !== undefined) spriteObject.setAlpha(sprite.alpha);
      if (sprite.scale !== undefined) spriteObject.setScale(sprite.scale);
      if (sprite.visible !== undefined) spriteObject.setVisible(sprite.visible);

      // const ignoreLayerOrder = options.ignoreLayerOrder !== false;

      console.log(`Set depth of ${fullPath} to ${sprite.layerOrder}`);
      spriteObject.setDepth(sprite.layerOrder);

      const wrappedSprite: WrappedObject = {
        name: sprite.name,
        type: sprite.type,
        placed: spriteObject,
        remove: createRemoveFunction(storageManager, psdKey, fullPath),
        updateAnimation:
          sprite.type === "animation"
            ? (config: any) => updateAnimation(scene, sprite.name, config)
            : undefined,
        setPosition: (x: number, y: number) => spriteObject!.setPosition(x, y),
        setAlpha: (alpha: number) => spriteObject!.setAlpha(alpha),
        ...getCustomAttributes(sprite),
      };

      return wrappedSprite;
    }
  } catch (error) {
    console.error(`Error placing sprite ${fullPath}:`, error);
  }

  return null;
}

function addDebugVisualization(
  scene: Phaser.Scene,
  spriteData: SpriteData,
  spriteObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container,
  options: any
) {
  const debugOptions = getDebugOptions(options.debug, options.globalDebug);
  if (debugOptions.shape || debugOptions.label) {
    const bounds = spriteObject.getBounds();
    createDebugShape(scene, "sprite", bounds.centerX, bounds.centerY, {
      name: spriteData.name,
      width: bounds.width,
      height: bounds.height,
      color: 0x00ff00,
      debugOptions,
      globalDebug: options.globalDebug,
    });
  }
}

function getSpriteByPath(
  sprites: SpriteData[],
  path: string
): SpriteData | null {
  const pathParts = path.split("/");
  let current = sprites;

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    const found = current.find((s: SpriteData) => s.name === part);
    if (!found) return null;
    if (i === pathParts.length - 1) {
      return found;
    }
    if (found.children) {
      current = found.children;
    } else {
      return null;
    }
  }

  return null;
}

function getCustomAttributes(sprite: SpriteData): Record<string, any> {
  const customAttributes: Record<string, any> = {};
  for (const key in sprite) {
    if (
      !["name", "type", "x", "y", "width", "height", "children"].includes(key)
    ) {
      customAttributes[key] = sprite[key];
    }
  }
  return customAttributes;
}

export { placeSingleSprite, placeSpritesRecursively };
