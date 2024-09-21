// src/modules/getTexture.ts

import PsdToPhaserPlugin from '../PsdToPhaserPlugin';
import { findLayer } from './shared/findLayer';

export default function getTextureModule(plugin: PsdToPhaserPlugin) {
  return function getTexture(scene: Phaser.Scene, psdKey: string, spritePath: string): Phaser.Textures.Texture | null {
    const psdData = plugin.getData(psdKey);
    if (!psdData) {
      console.log(`No PSD data found for key: ${psdKey}`);
      return null;
    }

    const pathParts = spritePath.split('/');
    const spriteData = findLayer(psdData.original.layers, pathParts);

    if (!spriteData) {
      console.log(`Sprite not found: ${spritePath}`);
      console.log(`Available sprites: ${JSON.stringify(psdData.original.layers.map((s: any) => s.name))}`);
      return null;
    }

    const textureKey = spriteData.name;

    // Check if the texture is already loaded
    if (scene.textures.exists(textureKey)) {
      return scene.textures.get(textureKey);
    }

    // If not loaded, load it synchronously
    const filePath = `${psdData.basePath}/${spriteData.filePath}`;
    
    scene.load.image(textureKey, filePath);
    scene.load.once(`filecomplete-image-${textureKey}`, () => {
      console.log(`Texture loaded: ${textureKey}`);
    });

    scene.load.start();

    // Wait for the texture to load
    scene.load.once('complete', () => {
      console.log(`Load complete for: ${textureKey}`);
    });

    // Double-check if the texture is now available
    if (scene.textures.exists(textureKey)) {
      return scene.textures.get(textureKey);
    }

    console.log(`Failed to load texture: ${textureKey}`);
    return null;
  };
}