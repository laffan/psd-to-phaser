import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';
import { placeTiles } from './types/tiles';

export default function placeModule(plugin: PsdToPhaserPlugin) {
  return function place(scene: Phaser.Scene, psdKey: string, layerName: string) {
    const psdData = plugin.getData(psdKey);
    if (!psdData) {
      console.error(`No data found for key: ${psdKey}`);
      return null;
    }

    const layer = psdData.tiles.find((tile: any) => tile.name === layerName);
    if (layer) {
      return placeTiles(scene, psdData, layerName, plugin);
    }

    // Add checks for other layer types (sprites, zones, etc.) here
    // Example:
    // const spriteLayer = psdData.sprites.find((sprite: any) => sprite.name === layerName);
    // if (spriteLayer) {
    //   return placeSprites(scene, psdData, layerName, plugin);
    // }

    console.error(`No layer found with name: ${layerName}`);
    return null;
  };
}

