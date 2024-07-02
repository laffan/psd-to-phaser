// modules/spritesModule.js
import { PSDObject } from "./psdObject";

export default function spritesModule(plugin) {
  return {
    place(scene, spritePath, psdKey, options = {}) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.sprites) {
        console.warn(`Sprite data for key '${psdKey}' not found.`);
        return null;
      }

      return PSDObject.place(
        scene,
        psdData,
        "sprites",
        spritePath,
        this.placeSprite.bind(this),
        options
      );
    },

    placeSprite(scene, sprite, options = {}) {
      const { name, x, y, width, height } = sprite;
      let spriteObject = null;

      if (!sprite.children || sprite.children.length === 0) {
        // Only create a sprite/image for leaf nodes
        if (sprite.lazyLoad && !sprite.isLoaded) {
          console.warn(
            `Sprite '${sprite.getPath()}' is set to lazy load and hasn't been loaded yet.`
          );
        } else {
          if (options.useImage) {
            spriteObject = scene.add.image(x, y, sprite.getPath());
          } else {
            spriteObject = scene.add.sprite(x, y, sprite.getPath());
          }
          spriteObject.setName(name);
          if (width !== undefined && height !== undefined) {
            spriteObject.setDisplaySize(width, height);
          }
          spriteObject.setOrigin(0, 0);
        }
      }

      const debugGraphics = sprite.createDebugBox(
        scene,
        "sprite",
        plugin,
        options
      );

      if (plugin.options.debug) {
        console.log(
          `Placed ${
            options.useImage ? "image" : "sprite"
          }: ${name} at (${x}, ${y}) with dimensions ${width}x${height}`
        );
      }

      const result = {
        layerData: sprite,
        debugGraphics,
      };

      // Use 'sprite' or 'image' key based on what was created
      if (spriteObject) {
        result[options.useImage ? "image" : "sprite"] = spriteObject;
      }

      if (sprite.children) {
        result.children = sprite.children.map((child) =>
          this.placeSprite(scene, child, options)
        );
      }

      return result;
    },

    placeAll(scene, psdKey, options = {}) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.sprites) {
        console.warn(`Sprite data for key '${psdKey}' not found.`);
        return null;
      }

      return psdData.sprites.map((rootSprite) =>
        PSDObject.place(
          scene,
          psdData,
          "sprites",
          rootSprite.name,
          this.placeSprite.bind(this),
          options
        )
      );
    },

    get(psdKey, path) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.placedSprites) {
        console.warn(`Placed sprite data for key '${psdKey}' not found.`);
        return null;
      }

      return psdData.placedSprites[path] || null;
    },
    countSprites(sprites) {
      return PSDObject.countRecursive(sprites);
    },
  };
}
