export default function spritesModule(plugin) {
  return {
    load(scene, sprites, basePath) {
      if (!Array.isArray(sprites)) {
        console.warn("No sprites to load or invalid sprites data");
        return;
      }

      sprites.forEach((sprite) => {
        this.loadSprite(scene, sprite, basePath);
      });
    },
    loadSprite(scene, sprite, basePath) {
      const {
        name,
        type,
        filename,
        x,
        y,
        width,
        height,
        frameWidth,
        frameHeight,
        frameCount,
      } = sprite;
      const path = `${basePath}/sprites/${filename || name}`;

      switch (type) {
        case "spritesheet":
          scene.load.spritesheet(name, `${path}.png`, {
            frameWidth: frameWidth || width,
            frameHeight: frameHeight || height,
          });
          break;
        case "atlas":
          scene.load.atlas(name, `${path}.png`, `${path}.json`);
          break;
        case "animation":
          scene.load.spritesheet(name, `${path}.png`, {
            frameWidth: frameWidth || width,
            frameHeight: frameHeight || height,
            endFrame: frameCount,
          });
          // We'll create the animation in the createSprite function
          break;
        case "merge":
        case undefined:
        case null:
        case "":
        default:
          // Treat as a regular image sprite
          scene.load.image(name, `${path}.png`);
          break;
      }

      if (plugin.options.debug) {
        console.log(`Loaded sprite: ${name} (${type || "image"})`);
      }
    },

    createSprite(scene, sprite) {
      const { name, x, y, type, frameRate, repeat } = sprite;

      let createdSprite;

      switch (type) {
        case "spritesheet":
        case "atlas":
          createdSprite = scene.add.sprite(x, y, name);
          break;
        case "animation":
          createdSprite = scene.add.sprite(x, y, name);
          // Create the animation
          scene.anims.create({
            key: `${name}_anim`,
            frames: scene.anims.generateFrameNumbers(name, {
              start: 0,
              end: -1,
            }),
            frameRate: frameRate || 24,
            repeat: repeat === undefined ? -1 : repeat,
          });
          createdSprite.play(`${name}_anim`);
          break;
        case "merge":
        case undefined:
        case null:
        case "":
        default:
          // Above cases Treated as a regular image sprite
          createdSprite = scene.add.image(x, y, name);
          break;
      }

      if (plugin.options.debug) {
        console.log(`Created sprite: ${name} at (${x}, ${y})`);
      }

      return createdSprite;
    },

    countSprites(sprites) {
      if (!Array.isArray(sprites)) return 0;

      return sprites.reduce((count, sprite) => {
        if (sprite.type === "multi" && Array.isArray(sprite.components)) {
          return count + this.countSprites(sprite.components);
        }
        return count + 1;
      }, 0);
    },
  };
}
