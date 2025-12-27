// src/modules/getTexture.ts

import PsdToPhaserPlugin from '../PsdToPhaser';
import { findLayer } from './shared/findLayer';
import { isSpriteLayer } from '../types';

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
      console.log(`Available sprites: ${JSON.stringify(psdData.original.layers.map((s) => s.name))}`);
      return null;
    }

    // getTexture only works with sprite layers that have a filePath
    if (!isSpriteLayer(spriteData)) {
      console.log(`Layer "${spritePath}" is not a sprite layer`);
      return null;
    }

    // Check if this PSD was loaded via loadMultiple and use namespaced texture key
    const isMultiplePsd = psdData.isMultiplePsd || false;
    const textureKey = isMultiplePsd ? `${psdKey}_${spriteData.name}` : spriteData.name;

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