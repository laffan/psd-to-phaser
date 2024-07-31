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
): Phaser.GameObjects.Group | null {
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

  // Add the main group to the scene
  if (wrappedObject.placed instanceof Phaser.GameObjects.Group) {
    scene.add.existing(wrappedObject.placed);
  } else {
    console.error("Expected a Group, but got a different type of game object.");
    return null;
  }

  // Store the wrapped object
  plugin.storageManager.store(psdKey, "", wrappedObject);

  return wrappedObject.placed as Phaser.GameObjects.Group;
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
  const group = scene.add.group();
  const children: WrappedObject[] = [];

  console.log(
    `Placing sprites recursively. Parent path: ${parentPath}, Depth: ${depth}`
  );

  sprites.forEach((sprite) => {
    const fullPath = parentPath ? `${parentPath}/${sprite.name}` : sprite.name;
    let spriteObject: WrappedObject | null = null;

    if (!sprite.children) {
      if (sprite.lazyLoad) {
        // For lazy-loaded sprites, create a placeholder
        spriteObject = createLazyLoadPlaceholder(scene, sprite, fullPath, psdKey, storageManager);
      } else {
        spriteObject = placeSingleSprite(
          scene,
          sprite,
          options,
          fullPath,
          psdKey,
          storageManager
        );
      }

      if (spriteObject) {
        group.add(spriteObject.placed);
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
      group.add(childWrappedObject.placed);
      children.push(childWrappedObject);
      storageManager.store(psdKey, fullPath, childWrappedObject);
      console.log(`Stored nested sprites for ${fullPath} in storage manager`);
    }
  });

  if (sprites[0] && sprites[0].initialDepth !== undefined) {
    console.log(`Set depth of ${parentPath} to ${sprites[0].initialDepth}`);
    group.setDepth(sprites[0].initialDepth);
  }

  const wrappedGroup: WrappedObject = {
    name: parentPath.split("/").pop() || "",
    type: "Group",
    placed: group,
    children: children,
    remove: createRemoveFunction(storageManager, psdKey, parentPath),
    setPosition: (x: number, y: number) => {
      group.getChildren().forEach((child: any) => {
        child.x += x;
        child.y += y;
      });
    },
    setAlpha: (alpha: number) => {
      group.setAlpha(alpha);
    },
    setVisible: (visible: boolean) => {
      group.setVisible(visible);
    },
    ...getCustomAttributes(sprites[0]),
  };

  storageManager.store(psdKey, parentPath, wrappedGroup);
  console.log(`Stored group for ${parentPath} in storage manager`);

  return wrappedGroup;
}

function createLazyLoadPlaceholder(
  scene: Phaser.Scene,
  sprite: SpriteData,
  fullPath: string,
  psdKey: string,
  storageManager: StorageManager
): WrappedObject {
  const placeholder = scene.add.rectangle(sprite.x, sprite.y, sprite.width, sprite.height, 0xcccccc, 0.5);
  placeholder.setOrigin(0, 0);
  placeholder.setDepth(sprite.initialDepth);

  const wrappedPlaceholder: WrappedObject = {
    name: sprite.name,
    type: "LazyLoadPlaceholder",
    placed: placeholder,
    remove: createRemoveFunction(storageManager, psdKey, fullPath),
    setPosition: (x: number, y: number) => placeholder.setPosition(x, y),
    setAlpha: (alpha: number) => placeholder.setAlpha(alpha),
    setVisible: (visible: boolean) => placeholder.setVisible(visible),
    ...getCustomAttributes(sprite),
  };

  return wrappedPlaceholder;
}

function placeSingleSprite(
  scene: Phaser.Scene,
  sprite: SpriteData,
  options: any,
  fullPath: string,
  psdKey: string,
  storageManager: StorageManager
): WrappedObject | null {
  let spriteObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Group | null = null;

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
      if (spriteObject instanceof Phaser.GameObjects.Group) {
        spriteObject.getChildren().forEach((child: any) => {
          child.x += sprite.x;
          child.y += sprite.y;
        });
      } else {
        spriteObject.setPosition(sprite.x, sprite.y);
      }
      if (sprite.alpha !== undefined) spriteObject.setAlpha(sprite.alpha);
      if (sprite.scale !== undefined && !(spriteObject instanceof Phaser.GameObjects.Group)) {
        spriteObject.setScale(sprite.scale);
      }

      console.log(`Set depth of ${fullPath} to ${sprite.initialDepth}`);
      spriteObject.setDepth(sprite.initialDepth);

      const wrappedSprite: WrappedObject = {
        name: sprite.name,
        type: sprite.type,
        placed: spriteObject,
        remove: createRemoveFunction(storageManager, psdKey, fullPath),
        updateAnimation:
          sprite.type === "animation"
            ? (config: any) => updateAnimation(scene, sprite.name, config)
            : undefined,
        setPosition: (x: number, y: number) => {
          if (spriteObject instanceof Phaser.GameObjects.Group) {
            spriteObject.getChildren().forEach((child: any) => {
              child.x += x - sprite.x;
              child.y += y - sprite.y;
            });
          } else {
            spriteObject!.setPosition(x, y);
          }
        },
        setAlpha: (alpha: number) => {
          spriteObject!.setAlpha(alpha);
        },
        setVisible: (visible: boolean) => {
          spriteObject!.setVisible(visible);
        },
        ...getCustomAttributes(sprite),
      };

      if (sprite.visible !== undefined) spriteObject.setVisible(sprite.visible);

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
  spriteObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Group,
  options: any
) {
  const debugOptions = getDebugOptions(options.debug, options.globalDebug);
  if (debugOptions.shape || debugOptions.label) {
    let bounds: Phaser.Geom.Rectangle;

    if (spriteObject instanceof Phaser.GameObjects.Group) {
      // For groups, calculate the bounds based on all children
      const children = spriteObject.getChildren();
      if (children.length === 0) {
        console.warn("Group is empty, cannot create debug visualization");
        return;
      }
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      children.forEach((child: any) => {
        minX = Math.min(minX, child.x);
        minY = Math.min(minY, child.y);
        maxX = Math.max(maxX, child.x + child.width);
        maxY = Math.max(maxY, child.y + child.height);
      });
      bounds = new Phaser.Geom.Rectangle(minX, minY, maxX - minX, maxY - minY);
    } else {
      bounds = spriteObject.getBounds();
    }

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
