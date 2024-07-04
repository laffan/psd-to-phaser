// src/modules/sprites.js
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
      const {
        name,
        x,
        y,
        width,
        height,
        type,
        frame_width,
        frame_height,
        placement,
        autoplacement = true,
        lazyLoad,
      } = sprite;
      let spriteObjects = [];
      let animationData = null;

      if (!sprite.children || sprite.children.length === 0) {
        if (lazyLoad) {
          if (plugin.options.debug) {
            console.log(
              `Sprite '${sprite.getPath()}' is set to lazy load. Skipping placement.`
            );
          }
          return { layerData: sprite, sprites: [], debugGraphics: null };
        }

        if (!sprite.isLoaded) {
          console.warn(`Sprite '${sprite.getPath()}' hasn't been loaded yet.`);
          return { layerData: sprite, sprites: [], debugGraphics: null };
        }

        if (type === "animation") {
          const animatedSpriteData = this.createAnimatedSprite(
            scene,
            sprite,
            options
          );
          spriteObjects.push(animatedSpriteData.sprite);
          animationData = animatedSpriteData;
        } else if (type === "spritesheet" && autoplacement) {
          placement.forEach((place, index) => {
            const spriteObject = scene.add.sprite(
              x + place.x,
              y + place.y,
              sprite.getPath(),
              place.frame
            );
            spriteObject.setName(`${name}_${index}`);
            spriteObject.setDisplaySize(frame_width, frame_height);
            spriteObject.setOrigin(0, 0);
            spriteObjects.push(spriteObject);
          });
        } else if (type !== "spritesheet" || autoplacement) {
          const spriteObject = options.useImage
            ? scene.add.image(x, y, sprite.getPath())
            : scene.add.sprite(x, y, sprite.getPath());
          spriteObject.setName(name);
          if (width !== undefined && height !== undefined) {
            spriteObject.setDisplaySize(width, height);
          }
          spriteObject.setOrigin(0, 0);
          spriteObjects.push(spriteObject);
        }
      }

      const debugGraphics =
        autoplacement && !lazyLoad
          ? sprite.createDebugBox(scene, "sprite", plugin, options)
          : null;

      if (plugin.options.debug && autoplacement && !lazyLoad) {
        console.log(
          `Placed ${
            type === "spritesheet"
              ? "spritesheet"
              : type === "animation"
              ? "animated sprite"
              : options.useImage
              ? "image"
              : "sprite"
          }: ${name} at (${x}, ${y}) with dimensions ${frame_width || width}x${
            frame_height || height
          }`
        );
      }

      const result = {
        layerData: sprite,
        sprites: spriteObjects,
        debugGraphics,
      };

      if (animationData) {
        result.animation = animationData.animation;
        result.animationKey = animationData.animationKey;
        result.play = animationData.play;
        result.pause = animationData.pause;
        result.resume = animationData.resume;
        result.stop = animationData.stop;
      }

      if (sprite.children) {
        result.children = sprite.children.map((child) =>
          this.placeSprite(scene, child, options)
        );
      }

      return result;
    },
    placeSpritesheet(scene, psdKey, spritesheetPath, x, y, frame = 0) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.sprites) {
        console.warn(`Sprite data for key '${psdKey}' not found.`);
        return null;
      }

      const spritesheet = this.findSpriteByPath(
        psdData.sprites,
        spritesheetPath
      );
      if (!spritesheet || spritesheet.type !== "spritesheet") {
        console.warn(
          `Spritesheet '${spritesheetPath}' not found or is not a spritesheet.`
        );
        return null;
      }

      const sprite = scene.add.sprite(x, y, spritesheetPath, frame);
      sprite.setDisplaySize(spritesheet.frame_width, spritesheet.frame_height);
      sprite.setOrigin(0, 0);

      return sprite;
    },
    createAnimatedSprite(scene, sprite, options = {}) {
      const { name, x, y, frame_width, frame_height } = sprite;
      const spriteObject = scene.add.sprite(x, y, sprite.getPath());
      spriteObject.setName(name);
      spriteObject.setDisplaySize(frame_width, frame_height);
      spriteObject.setOrigin(0, 0); // Set origin to top-left

      const validAnimProperties = [
        "frameRate",
        "duration",
        "delay",
        "repeat",
        "repeatDelay",
        "yoyo",
        "showOnStart",
        "hideOnComplete",
        "skipMissedFrames",
        "timeScale",
      ];

      const defaultAnimOptions = {
        key: `${sprite.getPath()}_animated`,
        frames: scene.anims.generateFrameNumbers(sprite.getPath(), {
          start: 0,
          end: sprite.frame_count - 1,
        }),
        frameRate: 10,
        repeat: -1,
        play: true,
      };

      // Include valid animation properties from the sprite data
      validAnimProperties.forEach((prop) => {
        if (sprite[prop] !== undefined) {
          defaultAnimOptions[prop] = sprite[prop];
        }
      });

      const animOptions = {
        ...defaultAnimOptions,
        ...options.animationOptions,
      };

      const animation = scene.anims.create(animOptions);

      if (animOptions.play) {
        spriteObject.play(animOptions.key);
      }

      const updateAnimation = (updateOptions) => {
        Object.entries(updateOptions).forEach(([key, value]) => {
          if (validAnimProperties.includes(key)) {
            animation[key] = value;
          }
        });

        if (updateOptions.frames) {
          animation.frames = scene.anims.generateFrameNumbers(
            sprite.getPath(),
            updateOptions.frames
          );
        }

        if (updateOptions.paused !== undefined) {
          updateOptions.paused
            ? spriteObject.anims.pause()
            : spriteObject.anims.resume();
        }

        spriteObject.anims.play(animation);
        return animation;
      };

      return {
        sprite: spriteObject,
        animation: animation,
        animationKey: animOptions.key,
        play: () => spriteObject.play(animOptions.key),
        pause: () => spriteObject.anims.pause(),
        resume: () => spriteObject.anims.resume(),
        stop: () => spriteObject.anims.stop(),
        updateAnimation,
      };
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
      if (!psdData || !psdData.sprites) {
        console.warn(`Sprite data for key '${psdKey}' not found.`);
        return null;
      }

      const pathParts = path.split("/");
      const spritePath = pathParts.join("/");

      // First, try to find the placed sprite
      let placedSprite = psdData.placedSprites
        ? psdData.placedSprites[spritePath]
        : null;

      // If not found in placed sprites, search in the original sprite data
      if (!placedSprite) {
        const spriteData = this.findSpriteByPath(psdData.sprites, spritePath);
        if (spriteData) {
          placedSprite = { layerData: spriteData };
        }
      }

      if (!placedSprite) return null;

      const { layerData } = placedSprite;

      if (layerData.type === "spritesheet") {
        return {
          layerData,
          getSprite: (frame = 0) => {
            return {
              texture: layerData.getPath(),
              frame: frame,
            };
          },
        };
      } else if (layerData.type === "animation") {
        const spriteObject = placedSprite.sprites[0];
        const animation = spriteObject.anims.currentAnim;

        return {
          sprite: spriteObject,
          animation: animation,
          animationKey: animation.key,
          play: () => spriteObject.play(animation.key),
          pause: () => spriteObject.anims.pause(),
          resume: () => spriteObject.anims.resume(),
          stop: () => spriteObject.anims.stop(),
          updateAnimation: (options) => {
            // ... (keep the existing updateAnimation logic)
          },
        };
      }

      return placedSprite.sprites[0];
    },
    getTexture(psdKey, spritePath) {
      const psdData = plugin.getData(psdKey);
      if (!psdData || !psdData.sprites) {
        console.warn(`Sprite data for key '${psdKey}' not found.`);
        return null;
      }

      const sprite = this.findSpriteByPath(psdData.sprites, spritePath);
      if (!sprite) {
        console.warn(`Sprite '${spritePath}' not found.`);
        return null;
      }

      // The texture key should be the same as the sprite's path in the PSD structure
      return spritePath;
    },

    findSpriteByPath(sprites, path) {
      const parts = path.split("/");
      let current = sprites.find((s) => s.name === parts[0]);

      for (let i = 1; i < parts.length; i++) {
        if (!current || !current.children) return null;
        current = current.children.find((c) => c.name === parts[i]);
      }

      return current;
    },

    countSprites(sprites) {
      return PSDObject.countRecursive(sprites);
    },
  };
}
