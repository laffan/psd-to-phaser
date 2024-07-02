// modules/spritesModule.js

export default function spritesModule(plugin) {
  return {
    place(scene, spritePath, psdKey, options = {}) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.sprites) {
        console.warn(`Sprite data for key '${psdKey}' not found.`);
        return null;
      }

      const rootSprite = psdData.sprites.find((s) =>
        spritePath.startsWith(s.name)
      );
      if (!rootSprite) {
        console.warn(
          `Sprite '${spritePath}' not found in PSD data for key '${psdKey}'.`
        );
        return null;
      }

      const targetSprite = rootSprite.findByPath(spritePath);
      if (!targetSprite) {
        console.warn(
          `Sprite '${spritePath}' not found in PSD data for key '${psdKey}'.`
        );
        return null;
      }

      return this.placeSprite(scene, targetSprite, options);
    },

    placeSprite(scene, sprite, options = {}) {
      const { name, x, y, width, height } = sprite;
      let image = null;

      if (!sprite.children || sprite.children.length === 0) {
        // Only create an image for leaf nodes
        if (sprite.lazyLoad && !sprite.isLoaded) {
          console.warn(
            `Sprite '${sprite.getPath()}' is set to lazy load and hasn't been loaded yet.`
          );
        } else {
          image = scene.add.image(x, y, sprite.getPath());
          if (width !== undefined && height !== undefined) {
            image.setDisplaySize(width, height);
          }
          image.setOrigin(0, 0);
        }
      }

      const debugGraphics = sprite.addDebugVisualization(
        scene,
        "sprite",
        plugin,
        options
      );

      if (plugin.options.debug) {
        console.log(
          `Placed sprite: ${name} at (${x}, ${y}) with dimensions ${width}x${height}`
        );
      }

      const result = { layerData: sprite, image, debugGraphics };

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
        this.placeSprite(scene, rootSprite, options)
      );
    },

    countSprites(sprites) {
      return this.countSpritesRecursive(sprites);
    },

    countSpritesRecursive(sprites) {
      return sprites.reduce((count, sprite) => {
        let total = 1; // Count the current sprite
        if (sprite.children) {
          total += this.countSpritesRecursive(sprite.children);
        }
        return count + total;
      }, 0);
    },
  };
}
