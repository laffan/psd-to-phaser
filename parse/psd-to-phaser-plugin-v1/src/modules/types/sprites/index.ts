import { SpriteData, AnimationConfig } from "../../types";
import { placeSprite } from "./defaultSprite";
import { placeAnimation, updateAnimation } from "./animation";
import { placeSpritesheet } from "./spritesheet";
import { placeAtlas } from "./atlas";

export default function spritesModule(plugin: any) {
  return {
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
      return this.placeSpritesRecursively(
        scene,
        [sprite],
        options,
        depth,
        psdKey
      );
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
      return this.placeSpritesRecursively(
        scene,
        psdData.sprites,
        options,
        depth,
        psdKey
      );
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
          // Don't set position on the child container, as child sprites will have their own absolute positions
          container.add(childContainer);
        }
      });

      return container;
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
