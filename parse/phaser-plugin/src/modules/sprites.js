// modules/sprites.js
import { createPSDObject } from "./psdObject";

export default function spritesModule(plugin) {
  return {
    load(scene, sprites, basePath, onProgress) {
      sprites.forEach((spriteData) => {
        this.loadSprite(scene, spriteData, basePath, onProgress);
      });
    },

    loadSprite(scene, spriteData, basePath, onProgress) {
      const sprite = createPSDObject(spriteData);
      const { name, filename } = sprite;
      const path = `${basePath}/sprites/${filename || name}.png`;

      scene.load.image(name, path);
      scene.load.once(`filecomplete-image-${name}`, onProgress);

      if (plugin.options.debug) {
        console.log(`Loading sprite: ${name} from ${path}`);
      }
    },

    create(scene, spritesData) {
      return spritesData.map((spriteData) => {
        const sprite = createPSDObject(spriteData);
        const { name, x, y, width, height } = sprite;
        const image = scene.add.image(x, y, name);

        if (width !== undefined && height !== undefined) {
          image.setDisplaySize(width, height);
        }

        if (plugin.options.debug) {
          console.log(`Created sprite: ${name} at (${x}, ${y})`);
        }

        return { layerData: sprite, image };
      });
    },

    place(scene, spriteName, psdKey) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.sprites) {
        console.warn(`Sprite data for key '${psdKey}' not found.`);
        return null;
      }

      const spriteData = psdData.sprites.find((s) => s.name === spriteName);
      if (!spriteData) {
        console.warn(
          `Sprite '${spriteName}' not found in PSD data for key '${psdKey}'.`
        );
        return null;
      }

      const sprite = createPSDObject(spriteData);
      const { x, y, width, height } = sprite;

      if (!scene.textures.exists(spriteName)) {
        console.warn(
          `Texture for sprite '${spriteName}' not found. Attempting to load it now.`
        );
        this.loadSprite(scene, spriteData, psdData.basePath, () => {
          console.log(`Texture for sprite '${spriteName}' loaded.`);
          return this.placeLoadedSprite(scene, sprite);
        });
        return null;
      }

      return this.placeLoadedSprite(scene, sprite);
    },

    placeLoadedSprite(scene, sprite, options = {}) {
      const { name, x, y, width, height } = sprite;
      const image = scene.add.image(x, y, name);

      if (width !== undefined && height !== undefined) {
        image.setDisplaySize(width, height);
      }

      image.setOrigin(0, 0);

      const debugGraphics = sprite.addDebugVisualization(
        scene,
        "sprite",
        plugin,
        options
      );

      return { layerData: sprite, image, debugGraphics };
    },
    countSprites(sprites) {
      return Array.isArray(sprites) ? sprites.length : 0;
    },
  };
}
