import { SpriteData } from '../typeDefinitions';

export function loadSprites(scene: Phaser.Scene, sprites: SpriteData[], basePath: string, onProgress: () => void, debug: boolean): void {
    const spritesToLoad = collectSpriteData(sprites, basePath);
    const totalSprites = spritesToLoad.length;
    let loadedSprites = 0;

    if (debug) {
        console.log('Immediate sprites to load:', spritesToLoad);
    }

    spritesToLoad.forEach(({ name, type, filePath, data }) => {
        if (debug) {
            console.log(`Attempting to load sprite: ${name} (${type})`);
            console.log(`File path: ${filePath}`);
            console.log('Data:', data);
        }

        switch (type) {
            case 'atlas':
                scene.load.atlas(name, filePath, data);
                break;
            case 'spritesheet':
                scene.load.spritesheet(name, filePath, {
                    frameWidth: data.frameWidth,
                    frameHeight: data.frameHeight,
                });
                break;
            default:
                scene.load.image(name, filePath);
        }

        scene.load.on(`filecomplete-${type}-${name}`, () => {
            loadedSprites++;
            const progress = loadedSprites / totalSprites;
            scene.events.emit('psdLoadProgress', progress);
            onProgress();

            if (debug) {
                console.log(`Loaded sprite: ${name} (${type}), Progress: ${(progress * 100).toFixed(2)}%`);
            }

            if (loadedSprites === totalSprites) {
                scene.events.emit('psdLoadComplete');
                if (debug) {
                    console.log('All sprites loaded');
                }
            }
        });
    });

    scene.load.on('loaderror', (file: any) => {
        console.error(`Error loading file: ${file.key}`);
        if (debug) {
            console.log('File details:', file);
        }
    });

    if (debug) {
        console.log(`Total sprites to load: ${totalSprites}`);
    }
}

function collectSpriteData(sprites: SpriteData[], basePath: string): Array<{ name: string, type: string, filePath: string, data: any }> {
    const flattenedSprites = flattenSprites(sprites);
    return flattenedSprites
        .filter(sprite => !sprite.lazyLoad) // Filter out lazy-loaded sprites
        .map(sprite => {
            const filePath = `${basePath}/sprites/${sprite.name}.png`;
            let type = 'image';
            let data = null;

            if (sprite.type === 'atlas') {
                type = 'atlas';
                data = sprite.atlas;
            } else if (sprite.type === 'spritesheet' || sprite.type === 'animation') {
                type = 'spritesheet';
                data = {
                    frameWidth: sprite.frame_width,
                    frameHeight: sprite.frame_height,
                };
            }

            return { name: sprite.name, type, filePath, data };
        });
}

function flattenSprites(sprites: SpriteData[], prefix = ''): SpriteData[] {
    return sprites.reduce((acc: SpriteData[], sprite) => {
        const name = prefix ? `${prefix}/${sprite.name}` : sprite.name;
        if (sprite.children) {
            return [...acc, ...flattenSprites(sprite.children, name)];
        }
        return [...acc, { ...sprite, name }];
    }, []);
}