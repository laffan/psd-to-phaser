/**
 * loadSprites
 * Loads sprite assets from the PSD data.
 * 
 * @param {Phaser.Scene} scene - The Phaser scene to load sprites into.
 * @param {Object[]} sprites - Array of sprite objects to load.
 * @param {string} basePath - The base path for sprite assets.
 * @param {Function} onProgress - Callback function to update loading progress.
 * 
 * @fires Phaser.Scene#filecomplete-image-{key}
 * @fires Phaser.Scene#filecomplete-spritesheet-{key}
 */

export function loadSprites(scene: Phaser.Scene, sprites: any[], basePath: string, onProgress: () => void, debug: boolean): void {
    sprites.forEach(({ path, obj }) => {
        const filePath = `${basePath}/sprites/${path}.png`;

        if (obj.type === 'atlas') {
          let transformedAtlasData
            try {
                transformedAtlasData = transformAtlasData(obj.atlas_data);
                scene.load.atlas(path, filePath, transformedAtlasData);
            } catch (error) {
                console.error(`Error loading atlas ${path}:`, error);
                if (debug) {
                    console.log('Original atlas data:', obj.atlas_data);
                    console.log('Transformed atlas data:', transformedAtlasData);
                }
                onProgress(); // Still call onProgress to avoid hanging the load process
                return; // Skip to the next sprite
            }
        } else if (obj.type === 'animation' || obj.type === 'spritesheet') {
            scene.load.spritesheet(path, filePath, {
                frameWidth: obj.frame_width,
                frameHeight: obj.frame_height,
            });
        } else {
            scene.load.image(path, filePath);
        }

        scene.load.once(`filecomplete-${obj.type === 'atlas' ? 'atlas' : obj.type === 'animation' || obj.type === 'spritesheet' ? 'spritesheet' : 'image'}-${path}`, () => {
            obj.isLoaded = true;
            onProgress();
        });

        scene.load.once(`loaderror`, (file: any) => {
            if (file.key === path) {
                console.error(`Error loading file: ${path}`);
                if (debug) {
                    console.log('File details:', file);
                }
                onProgress(); // Still call onProgress to avoid hanging the load process
            }
        });

        if (debug) {
            console.log(`Loading ${obj.type}: ${path} from ${filePath}`);
        }
    });
}

function transformAtlasData(atlasData: any): any {
    const frames: { [key: string]: any } = {};
    
    atlasData.frames.forEach((frame: any) => {
        frames[frame.name] = {
            frame: { x: frame.x, y: frame.y, w: frame.w, h: frame.h },
            rotated: false,
            trimmed: false,
            spriteSourceSize: { x: 0, y: 0, w: frame.w, h: frame.h },
            sourceSize: { w: frame.w, h: frame.h }
        };
    });

    return {
        frames,
        meta: {
            scale: "1",
            format: "RGBA8888",
            size: { w: atlasData.meta.width, h: atlasData.meta.height },
            image: atlasData.meta.image
        }
    };
}