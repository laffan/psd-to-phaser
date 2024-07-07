import PsdToPhaserPlugin, { DebugOptions } from "../../../PsdToPhaserPlugin";
import { SpriteData, AnimationConfig } from "../../types";
import { placeSprite } from "./defaultSprite";
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
      const placedSprite = this.placeSpritesRecursively(
        scene,
        [sprite],
        options,
        depth,
        psdKey
      );

      // Store the placed sprite
      plugin.storageManager.store(psdKey, spritePath, placedSprite);

      return placedSprite;
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
      const container = this.placeSpritesRecursively(
        scene,
        psdData.sprites,
        options,
        depth,
        psdKey
      );

      // Store the entire container
      plugin.storageManager.store(psdKey, "", container);

      return container;
    },

    placeSpritesRecursively(
      scene: Phaser.Scene,
      sprites: SpriteData[],
      options: any = {},
      depth: number,
      psdKey: string,
      parentPath: string = ""
    ): Phaser.GameObjects.Container {
      const container = scene.add.container(0, 0);

      sprites.forEach((sprite) => {
        const fullPath = parentPath
          ? `${parentPath}/${sprite.name}`
          : sprite.name;
        let spriteObject:
          | Phaser.GameObjects.Sprite
          | Phaser.GameObjects.Container
          | null = null;

        if (!sprite.children) {
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
              spriteObject = placeSprite(scene, sprite, options, fullPath);
              break;
          }

          if (spriteObject) {
            // Set the position directly on the sprite object
            spriteObject.setPosition(sprite.x, sprite.y);
            container.add(spriteObject);

            // Add debug visualization
            this.addDebugVisualization(scene, sprite, spriteObject, options);
            plugin.storageManager.store(psdKey, fullPath, spriteObject);
          }
        }

        if (sprite.children && depth > 0) {
          const childContainer = this.placeSpritesRecursively(
            scene,
            sprite.children,
            options,
            depth - 1,
            psdKey,
            fullPath
          );

          plugin.storageManager.store(psdKey, fullPath, childContainer);

          // Don't set position on the child container, as child sprites will have their own absolute positions
          container.add(childContainer);
        }
      });

      return container;
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
  };
}
