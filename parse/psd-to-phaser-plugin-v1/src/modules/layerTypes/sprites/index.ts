// src/modules/types/sprites/index.ts

import { SpriteData } from "../../typeDefinitions";
import { placeSprite as placeSimpleSprite } from "./defaultSprite";
import { placeAnimation, updateAnimation } from "./animation";
import { placeSpritesheet } from "./spritesheet";
import { placeAtlas } from "./atlas";
import { createDebugShape } from "../../utils/debugVisualizer";
import { getDebugOptions } from "../../utils/sharedUtils";
import { getSprite, getAllSprites, getTexture } from "./get";

export default function spritesModule(plugin: PsdToPhaserPlugin) {
  return {
    get: (psdKey: string, spritePath: string) =>
      getSprite(plugin, psdKey, spritePath),
    getAll: (psdKey: string, options?: { depth?: number }) =>
      getAllSprites(plugin, psdKey, options),
    getTexture: (psdKey: string, spritePath: string) =>
      getTexture(plugin, psdKey, spritePath),

    place(
      scene: Phaser.Scene,
      psdKey: string,
      spritePath: string,
      options: any = {}
    ): Phaser.GameObjects.Container | null {
      const psdData = plugin.getData(psdKey);
      if (!psdData) {
        console.error(`PSD data for key '${psdKey}' not found.`);
        return null;
      }

      const sprite = this.getSpriteByPath(psdData.sprites, spritePath);
      if (!sprite) {
        console.error(`Sprite '${spritePath}' not found in PSD data.`);
        return null;
      }

      const depth = options.depth !== undefined ? options.depth : Infinity;
      const parentPath = spritePath.split("/").slice(0, -1).join("/");
      const placedSprite = this.placeSpritesRecursively(
        scene,
        [sprite],
        options,
        depth,
        psdKey,
        parentPath // Pass the parent path here
      );

      // Store the placed sprite
      plugin.storageManager.store(psdKey, spritePath, placedSprite);

      return placedSprite.placed as Phaser.GameObjects.Container;
    },

    placeAll(
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
      const wrappedObject = this.placeSpritesRecursively(
        scene,
        psdData.sprites,
        options,
        depth,
        psdKey
      );

      // Add the main container to the scene
      scene.add.existing(wrappedObject.placed);

      // Store the wrapped object
      plugin.storageManager.store(psdKey, "", wrappedObject);

      return wrappedObject.placed as Phaser.GameObjects.Container;
    },

    placeSpritesRecursively(
      scene: Phaser.Scene,
      sprites: SpriteData[],
      options: any = {},
      depth: number,
      psdKey: string,
      parentPath: string = ""
    ): WrappedObject {
      const container = scene.add.container(0, 0);
      const children: WrappedObject[] = [];

      sprites.forEach((sprite) => {
        const fullPath = parentPath
          ? `${parentPath}/${sprite.name}`
          : sprite.name;
        let spriteObject:
          | Phaser.GameObjects.Sprite
          | Phaser.GameObjects.Container
          | null = null;

        if (!sprite.children) {
          spriteObject = this.placeSingleSprite(
            scene,
            sprite,
            options,
            fullPath
          );

          if (spriteObject) {
            container.add(spriteObject);
            this.addDebugVisualization(scene, sprite, spriteObject, options);

            const wrappedSprite: WrappedObject = {
              name: sprite.name,
              type: sprite.type,
              placed: spriteObject,
              updateAnimation:
                sprite.type === "animation"
                  ? (config: any) => updateAnimation(scene, sprite.name, config)
                  : undefined,
              setPosition: (x: number, y: number) =>
                spriteObject.setPosition(x, y),
              setAlpha: (alpha: number) => spriteObject.setAlpha(alpha),
              ...this.getCustomAttributes(sprite), // Spread custom attributes here
            };

            children.push(wrappedSprite);
            plugin.storageManager.store(psdKey, fullPath, wrappedSprite);
          }
        }

        if (sprite.children && depth > 0) {
          const childWrappedObject = this.placeSpritesRecursively(
            scene,
            sprite.children,
            options,
            depth - 1,
            psdKey,
            fullPath
          );
          container.add(childWrappedObject.placed);
          children.push(childWrappedObject);
        }
      });

      const wrappedContainer: WrappedObject = {
        name: parentPath.split("/").pop() || "",
        type: "Container",
        placed: container,
        children: children,
        setPosition: (x: number, y: number) => container.setPosition(x, y),
        setAlpha: (alpha: number) => container.setAlpha(alpha),
        ...this.getCustomAttributes(sprites[0]), // Spread custom attributes here
      };

      plugin.storageManager.store(psdKey, parentPath, wrappedContainer);
      return wrappedContainer;
    },

    placeSingleSprite(
      scene: Phaser.Scene,
      sprite: SpriteData,
      options: any,
      fullPath: string
    ): Phaser.GameObjects.Sprite | Phaser.GameObjects.Container | null {
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
          if (sprite.visible !== undefined)
            spriteObject.setVisible(sprite.visible);
        }
      } catch (error) {
        console.error(`Error placing sprite ${fullPath}:`, error);
      }

      return spriteObject;
    },

    addDebugVisualization(
      scene: Phaser.Scene,
      spriteData: SpriteData,
      spriteObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container,
      options: any
    ) {
      const debugOptions = getDebugOptions(options.debug, plugin.options.debug);
      if (debugOptions.shape || debugOptions.label) {
        const bounds = spriteObject.getBounds();
        createDebugShape(scene, "sprite", bounds.centerX, bounds.centerY, {
          name: spriteData.name,
          width: bounds.width,
          height: bounds.height,
          color: 0x00ff00,
          debugOptions,
          globalDebug: plugin.options.debug,
        });
      }
    },

    updateAnimation,

    getSpriteByPath(sprites: SpriteData[], path: string): SpriteData | null {
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
    },

    getCustomAttributes(sprite: SpriteData): Record<string, any> {
      const customAttributes: Record<string, any> = {};
      for (const key in sprite) {
        if (
          !["name", "type", "x", "y", "width", "height", "children"].includes(
            key
          )
        ) {
          customAttributes[key] = sprite[key];
        }
      }
      return customAttributes;
    },
  };
}
