import { SpriteData } from '../../../types';

export default function spritesModule(plugin: any) {
    return {
        place(scene: Phaser.Scene, psdKey: string, spritePath: string, options: any = {}): Phaser.GameObjects.Sprite | Phaser.GameObjects.Container | null {
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

            switch (sprite.type) {
                case 'atlas':
                    return this.placeAtlas(scene, sprite, options);
                case 'spritesheet':
                    return this.placeSpritesheet(scene, sprite, options);
                case 'merged':
                case 'simple':
                default:
                    return this.placeSprite(scene, sprite, options);
            }
        },

        placeAll(scene: Phaser.Scene, psdKey: string, options: any = {}): (Phaser.GameObjects.Sprite | Phaser.GameObjects.Container)[] {
            const psdData = plugin.getData(psdKey);
            if (!psdData) {
                console.error(`PSD data for key '${psdKey}' not found.`);
                return [];
            }

            return this.placeSpritesRecursively(scene, psdData.sprites, options);
        },

        placeSprite(scene: Phaser.Scene, sprite: SpriteData, options: any = {}): Phaser.GameObjects.Sprite {
            const gameObject = scene.add.sprite(sprite.x, sprite.y, sprite.name);
            gameObject.setName(sprite.name);
            gameObject.setDepth(sprite.layerOrder);

            if (options.debug) {
                console.log(`Placed sprite: ${sprite.name} at (${sprite.x}, ${sprite.y}), depth: ${sprite.layerOrder}`);
            }

            return gameObject;
        },

        placeAtlas(scene: Phaser.Scene, atlasData: SpriteData, options: any = {}): Phaser.GameObjects.Container {
            const container = scene.add.container(atlasData.x, atlasData.y);
            container.setName(atlasData.name);

            atlasData.placement.forEach((piece) => {
                const { frame, x, y, layerOrder, instanceName } = piece;
                const sprite = scene.add.sprite(x, y, atlasData.name, frame);
                sprite.setName(instanceName);
                container.add(sprite);
                sprite.setDepth(layerOrder);

                if (options.debug) {
                    console.log(`Placed atlas piece: ${instanceName} at (${x}, ${y}), frame: ${frame}, depth: ${layerOrder}`);
                }
            });

            container.setDepth(atlasData.layerOrder);

            if (options.debug) {
                console.log(`Placed atlas: ${atlasData.name} with ${atlasData.placement.length} pieces`);
            }

            return container;
        },

        placeSpritesheet(scene: Phaser.Scene, spritesheetData: SpriteData, options: any = {}): Phaser.GameObjects.Container {
            const container = scene.add.container(spritesheetData.x, spritesheetData.y);
            container.setName(spritesheetData.name);

            spritesheetData.placement.forEach((piece) => {
                const { frame, x, y, layerOrder, instanceName } = piece;
                const sprite = scene.add.sprite(x, y, spritesheetData.name, frame);
                sprite.setName(instanceName);
                container.add(sprite);
                sprite.setDepth(layerOrder);

                if (options.debug) {
                    console.log(`Placed spritesheet piece: ${instanceName} at (${x}, ${y}), frame: ${frame}, depth: ${layerOrder}`);
                }
            });

            container.setDepth(spritesheetData.layerOrder);

            if (options.debug) {
                console.log(`Placed spritesheet: ${spritesheetData.name} with ${spritesheetData.placement.length} pieces`);
            }

            return container;
        },

        placeSpritesRecursively(scene: Phaser.Scene, sprites: SpriteData[], options: any = {}): (Phaser.GameObjects.Sprite | Phaser.GameObjects.Container)[] {
            let placedSprites: (Phaser.GameObjects.Sprite | Phaser.GameObjects.Container)[] = [];

            sprites.forEach((sprite) => {
                const placedSprite = this.place(scene, '', sprite.name, options);
                if (placedSprite) {
                    placedSprites.push(placedSprite);
                }

                if (sprite.children) {
                    placedSprites = placedSprites.concat(
                        this.placeSpritesRecursively(scene, sprite.children, options)
                    );
                }
            });

            return placedSprites;
        },

        getSpriteByPath(sprites: SpriteData[], path: string): SpriteData | null {
            const pathParts = path.split('/');
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
        }
    };
}