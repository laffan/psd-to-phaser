/**
 * Texture retrieval module – extracts Phaser textures from loaded sprites
 * so they can be reused for particles, manual sprite creation, etc.
 *
 * @module getTexture
 */

import PsdToPhaserPlugin from '../PsdToPhaser';
import { findLayer } from './shared/findLayer';
import { isSpriteLayer } from '../types';

/**
 * Factory that creates the public `getTexture()` function bound to the plugin.
 *
 * @param plugin - The PsdToPhaser plugin instance
 * @returns The `getTexture()` function
 *
 * @internal
 */
export default function getTextureModule(plugin: PsdToPhaserPlugin) {
  /**
   * Get the Phaser Texture for a loaded sprite by path.
   *
   * Once a sprite has been loaded, you can grab its texture for use
   * with particle emitters, manual sprite placement, or other systems.
   * Supports spritesheets, atlases, and simple image sprites.
   *
   * **Important:** Remember the depth gotcha – manually placed items
   * may be hidden behind PSD layers. Set a high depth value.
   *
   * @param scene - The Phaser scene
   * @param psdKey - The key used when loading the PSD
   * @param spritePath - Slash-delimited path to the sprite layer
   * @returns The Phaser Texture, or `null` if not found
   *
   * @example
   * ```js
   * const tex = this.P2P.getTexture(this, "psd_key", "simpleSprite");
   * this.newSprite = this.add.sprite(200, 30, tex);
   * this.newSprite.setDepth(100); // avoid depth gotcha
   *
   * // Atlas frames for particles
   * const atlasTex = this.P2P.getTexture(this, "psd_key", "anAtlas");
   * this.add.particles(200, 30, atlasTex, {
   *   frame: ['pinkDot', 'greenDot'],
   *   speed: 100,
   * });
   * ```
   */
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