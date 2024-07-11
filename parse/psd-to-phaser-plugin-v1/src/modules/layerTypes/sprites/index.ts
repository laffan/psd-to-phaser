import PsdToPhaserPlugin from "../../../PsdToPhaserPlugin";
import { placeSprite, placeAllSprites, placeSingleSprite, placeSpritesRecursively } from "./place";
import { getSprite, getAllSprites, getTexture } from "./get";
import { updateAnimation } from "./animation";

export default function spritesModule(plugin: PsdToPhaserPlugin) {
  return {
    get: (psdKey: string, spritePath: string) =>
      getSprite(plugin, psdKey, spritePath),
    getAll: (psdKey: string, options?: { depth?: number }) =>
      getAllSprites(plugin, psdKey, options),
    getTexture: (psdKey: string, spritePath: string) =>
      getTexture(plugin, psdKey, spritePath),
    place: (scene: Phaser.Scene, psdKey: string, spritePath: string, options: any = {}) =>
      placeSprite(plugin, scene, psdKey, spritePath, options),
    placeAll: (scene: Phaser.Scene, psdKey: string, options: any = {}) =>
      placeAllSprites(plugin, scene, psdKey, options),
    placeSingleSprite,
    placeSpritesRecursively,
    updateAnimation
  };
}