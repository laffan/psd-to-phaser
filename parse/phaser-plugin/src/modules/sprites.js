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
        layerOrder,
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

        if (type === "atlas") {
          const atlasContainer = this.createAtlasSprite(scene, sprite, options);
          atlasContainer.setDepth(layerOrder);
          spriteObjects.push(atlasContainer);
        } else if (type === "animation") {
          const animatedSpriteData = this.createAnimatedSprite(
            scene,
            sprite,
            options
          );
          animatedSpriteData.sprite.setDepth(layerOrder);
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
            spriteObject.setDepth(layerOrder);
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
          spriteObject.setDepth(layerOrder);
          spriteObjects.push(spriteObject);
        }
      }

      const debugGraphics = sprite.createDebugBox(
        scene,
        "sprite",
        plugin,
        options
      );
      if (debugGraphics) {
        debugGraphics.setDepth(layerOrder + 0.1); // Set debug graphics slightly above the sprite
      }

      if (plugin.options.debug) {
        console.log(
          `Placed ${
            type === "atlas"
              ? "atlas"
              : type === "spritesheet"
              ? "spritesheet"
              : type === "animation"
              ? "animated sprite"
              : options.useImage
              ? "image"
              : "sprite"
          }: ${name} at (${x}, ${y}) with dimensions ${width}x${height} and depth ${layerOrder}`
        );
      }

      const result = {
        layerData: sprite,
        sprites: spriteObjects,
        debugGraphics,
      };

      if (type === "atlas") {
        result.getFrameSprite = spriteObjects[0].getFrameSprite;
      } else if (animationData) {
        result.animation = animationData.animation;
        result.animationKey = animationData.animationKey;
        result.play = animationData.play;
        result.pause = animationData.pause;
        result.resume = animationData.resume;
        result.stop = animationData.stop;
        result.updateAnimation = animationData.updateAnimation;
      }

      if (sprite.children) {
        result.children = sprite.children.map((child) =>
          this.placeSprite(scene, child, options)
        );
      }

      return result;
    },

    createAtlasSprite(scene, sprite, options) {
      const { name, x, y, width, height, atlas_image, atlas_data } = sprite;

      if (!scene.textures.exists(atlas_image)) {
        // If the texture doesn't exist as an atlas, create it
        scene.textures.addAtlas(
          atlas_image,
          scene.textures.get(sprite.getPath()).getSourceImage(),
          atlas_data
        );
      }

      // Create a container to hold all frames
      const container = scene.add.container(x, y);
      container.setName(name);

      // Get all frame names from the atlas
      const frameNames = Object.keys(atlas_data.frames);

      // Create a sprite for each frame and add it to the container
      frameNames.forEach((frameName) => {
        const frameData = atlas_data.frames[frameName];
        const frameSprite = scene.add.sprite(
          frameData.relative.x,
          frameData.relative.y,
          atlas_image,
          frameName
        );
        frameSprite.setName(`${name}_${frameName}`);
        frameSprite.setOrigin(0, 0);

        // All frames are visible by default now
        container.add(frameSprite);
      });

      // Set the size of the container
      container.setSize(width, height);

      // Add method to get a specific frame sprite
      container.getFrameSprite = (frameName) => {
        return container.list.find(
          (child) => child.name === `${name}_${frameName}`
        );
      };

      if (plugin.options.debug) {
        console.log(
          `Created atlas sprite '${name}' with ${frameNames.length} frames`
        );
      }

      return container;
    },

    createAnimatedSprite(scene, sprite, options = {}) {
      const {
        name,
        x,
        y,
        frame_width,
        frame_height,
        frame_count,
        columns,
        rows,
      } = sprite;
      const spriteObject = scene.add.sprite(x, y, sprite.getPath());
      spriteObject.setName(name);
      spriteObject.setDisplaySize(frame_width, frame_height);
      spriteObject.setOrigin(0, 0);

      // Create the spritesheet if it doesn't exist
      if (!scene.textures.exists(sprite.getPath())) {
        scene.textures.addSpriteSheet(
          sprite.getPath(),
          scene.textures.get(sprite.getPath()).getSourceImage(),
          {
            frameWidth: frame_width,
            frameHeight: frame_height,
            startFrame: 0,
            endFrame: frame_count - 1,
            margin: 0,
            spacing: 0,
          }
        );
      }

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

      // Create the animation if it doesn't exist
      if (!scene.anims.exists(animOptions.key)) {
        const animation = scene.anims.create(animOptions);
      }

      // Play the animation
      spriteObject.play(animOptions.key);

      const updateAnimation = (updateOptions) => {
        const animation = scene.anims.get(animOptions.key);
        if (!animation) return;

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

        spriteObject.play(animOptions.key);
        return animation;
      };

      return {
        sprite: spriteObject,
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

      // Sort sprites by layerOrder before placing
      const sortedSprites = [...psdData.sprites].sort(
        (a, b) => a.layerOrder - b.layerOrder
      );

      return sortedSprites.map((rootSprite) =>
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

      let placedSprite = psdData.placedSprites
        ? psdData.placedSprites[spritePath]
        : null;

      if (!placedSprite) {
        const spriteData = this.findSpriteByPath(psdData.sprites, spritePath);
        if (spriteData) {
          placedSprite = { layerData: spriteData };
        }
      }

      if (!placedSprite) return null;

      const { layerData } = placedSprite;

      if (layerData.type === "atlas") {
        const sprite = placedSprite.sprites[0];
        return {
          sprite,
          setFrame: (frameName) => sprite.setFrame(frameName),
        };
      } else if (layerData.type === "spritesheet") {
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

      if (sprite.type === "atlas") {
        const pathParts = spritePath.split("/");
        if (pathParts.length > 1) {
          // Return specific frame texture
          return {
            texture: sprite.atlas_image,
            frame: pathParts[pathParts.length - 1],
          };
        } else {
          // Return all named frames
          return Object.keys(sprite.atlas_data.frames).map((frameName) => ({
            texture: sprite.atlas_image,
            frame: frameName,
          }));
        }
      } else if (sprite.type === "spritesheet") {
        return sprite.getPath();
      }

      // For regular sprites
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

    loadSprites(scene, sprites, basePath, onProgress) {
      sprites.forEach(({ path, obj }) => {
        if (obj.lazyLoad) {
          if (plugin.options.debug) {
            console.log(`Skipping load for lazy-loaded sprite: ${path}`);
          }
          return;
        }

        const filePath = `${basePath}/sprites/${path}.png`;

        if (obj.type === "atlas") {
          scene.load.atlas(path, filePath, obj.atlas_data);
        } else if (obj.type === "animation" || obj.type === "spritesheet") {
          scene.load.spritesheet(path, filePath, {
            frameWidth: obj.frame_width,
            frameHeight: obj.frame_height,
          });
        } else {
          scene.load.image(path, filePath);
        }

        scene.load.once(
          `filecomplete-${
            obj.type === "atlas"
              ? "atlas"
              : obj.type === "animation" || obj.type === "spritesheet"
              ? "spritesheet"
              : "image"
          }-${path}`,
          () => {
            obj.isLoaded = true;
            onProgress();
          }
        );

        if (plugin.options.debug) {
          console.log(
            `Loading ${
              obj.type === "atlas"
                ? "atlas"
                : obj.type === "animation"
                ? "animation spritesheet"
                : obj.type === "spritesheet"
                ? "spritesheet"
                : "sprite"
            }: ${path} from ${filePath}`
          );
        }
      });
    },
  };
}
