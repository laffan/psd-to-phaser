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
      const { name, x, y, width, height, type } = sprite;
      let spriteObject = null;
      let animationData = null;

      if (!sprite.children || sprite.children.length === 0) {
        if (sprite.lazyLoad && !sprite.isLoaded) {
          console.warn(
            `Sprite '${sprite.getPath()}' is set to lazy load and hasn't been loaded yet.`
          );
        } else {
          if (type === "animation") {
            const animatedSpriteData = this.createAnimatedSprite(
              scene,
              sprite,
              options
            );
            spriteObject = animatedSpriteData.sprite;
            animationData = animatedSpriteData;
          } else {
            spriteObject = options.useImage
              ? scene.add.image(x, y, sprite.getPath())
              : scene.add.sprite(x, y, sprite.getPath());
          }
          spriteObject.setName(name);
          if (width !== undefined && height !== undefined) {
            spriteObject.setDisplaySize(width, height);
          }
          spriteObject.setOrigin(0, 0);
        }
      }

      const debugBox = sprite.createDebugBox(scene, "sprite", plugin, options);
      if (debugBox) {
        debugBox.setPosition(x, y);
      }

      if (plugin.options.debug) {
        console.log(
          `Placed ${
            type === "animation"
              ? "animated sprite"
              : options.useImage
              ? "image"
              : "sprite"
          }: ${name} at (${x}, ${y}) with dimensions ${width}x${height}`
        );
      }

      const result = {
        layerData: sprite,
        debugBox,
      };

      if (spriteObject) {
        result[
          type === "animation"
            ? "sprite"
            : options.useImage
            ? "image"
            : "sprite"
        ] = spriteObject;
        if (animationData) {
          result.animation = animationData.animation;
          result.animationKey = animationData.animationKey;
          result.play = animationData.play;
          result.pause = animationData.pause;
          result.resume = animationData.resume;
          result.stop = animationData.stop;
        }

        spriteObject.on("changeposition", () => {
          if (debugBox) {
            debugBox.setPosition(spriteObject.x, spriteObject.y);
          }
        });

        const originalSetPosition = spriteObject.setPosition;
        spriteObject.setPosition = function (x, y) {
          originalSetPosition.call(this, x, y);
          this.emit("changeposition");
        };
      }

      if (sprite.children) {
        result.children = sprite.children.map((child) =>
          this.placeSprite(scene, child, options)
        );
      }

      return result;
    },

    createAnimatedSprite(scene, sprite, options = {}) {
      const { name, x, y, frame_count } = sprite;
      const spriteObject = scene.add.sprite(x, y, sprite.getPath());

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
          end: frame_count - 1,
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
      if (!psdData || !psdData.placedSprites) {
        console.warn(`Placed sprite data for key '${psdKey}' not found.`);
        return null;
      }

      const placedSprite = psdData.placedSprites[path];
      if (!placedSprite) return null;

      if (placedSprite.layerData.type === "animation") {
        const spriteObject = placedSprite.sprite;
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
            const validProperties = [
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

            Object.entries(options).forEach(([key, value]) => {
              if (validProperties.includes(key)) {
                animation[key] = value;
              }
            });

            // Update frames if provided
            if (options.frames) {
              animation.frames = spriteObject.anims.generateFrameNames(
                spriteObject.texture.key,
                options.frames
              );
            }

            // Handle special cases
            if (options.paused !== undefined) {
              options.paused
                ? spriteObject.anims.pause()
                : spriteObject.anims.resume();
            }

            // Restart the animation to apply changes
            spriteObject.anims.play(animation);

            return animation;
          },
        };
      }

      return placedSprite.sprite || placedSprite.image;
    },

    countSprites(sprites) {
      return PSDObject.countRecursive(sprites);
    },
  };
}
