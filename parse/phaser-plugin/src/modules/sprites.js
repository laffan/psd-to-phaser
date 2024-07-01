// modules/sprites.js
export default function spritesModule(plugin) {
    return {
        load(scene, sprites, basePath, onProgress) {
            sprites.forEach((sprite) => {
                this.loadSprite(scene, sprite, basePath, onProgress);
            });
        },

        loadSprite(scene, sprite, basePath, onProgress) {
            const { name, filename } = sprite;
            const path = `${basePath}/sprites/${filename || name}.png`;

            scene.load.image(name, path);
            scene.load.once(`filecomplete-image-${name}`, onProgress);

            if (plugin.options.debug) {
                console.log(`Loading sprite: ${name} from ${path}`);
            }
        },

        create(scene, sprites) {
            sprites.forEach((sprite) => {
                const { name, x, y } = sprite;
                scene.add.image(x, y, name);
                
                if (plugin.options.debug) {
                    console.log(`Created sprite: ${name} at (${x}, ${y})`);
                }
            });
        },

        countSprites(sprites) {
            return Array.isArray(sprites) ? sprites.length : 0;
        },

        place(scene, spriteName, psdKey) {
            const psdData = plugin.getData(psdKey);
            if (!psdData) {
                console.warn(`PSD data for key '${psdKey}' not found.`);
                return null;
            }

            const spriteData = psdData.sprites.find(s => s.name === spriteName);
            
            if (!spriteData) {
                console.warn(`Sprite '${spriteName}' not found in PSD data for key '${psdKey}'.`);
                return null;
            }

            const { x, y, width, height } = spriteData;

            // Check if the texture is loaded
            if (!scene.textures.exists(spriteName)) {
                console.warn(`Texture for sprite '${spriteName}' not found. Attempting to load it now.`);
                this.loadSprite(scene, spriteData, psdData.basePath, () => {
                    console.log(`Texture for sprite '${spriteName}' loaded.`);
                    this.placeLoadedSprite(scene, spriteName, x, y, width, height);
                });
                return null;
            }

            return this.placeLoadedSprite(scene, spriteName, x, y, width, height);
        },

        placeLoadedSprite(scene, spriteName, x, y, width, height) {
            const sprite = scene.add.image(x, y, spriteName);

            // Set the origin to top-left (0, 0) to match the PSD coordinates
            sprite.setOrigin(0, 0);

            // Set the display size to match the PSD dimensions
            sprite.setDisplaySize(width, height);

            if (plugin.options.debug) {
                console.log(`Placed sprite: ${spriteName} at (${x}, ${y}) with dimensions ${width}x${height}`);
            }

            return sprite;
        }
    };
}