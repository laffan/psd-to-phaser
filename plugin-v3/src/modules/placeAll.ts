import PsdToPhaserPlugin from '../PsdToPhaserPlugin';
import { attachMethods } from './shared/attachMethods';
import { placeTiles } from './place/types/tiles';
import { placeSprites } from './place/types/sprites';
import { placeZones } from './place/types/zones';
import { placePoints } from './place/types/points';

export default function placeAllModule(plugin: PsdToPhaserPlugin) {
  return function placeAll(scene: Phaser.Scene, psdKey: string): Phaser.GameObjects.Group {
    const psdData = plugin.getData(psdKey);
    if (!psdData || !psdData.initialLoad) {
      console.error(`No initialLoad data found for key: ${psdKey}`);
      return scene.add.group();
    }

    const group = scene.add.group();
    const tileSliceSize = psdData.original.tile_slice_size || 150;

    // Place tiles
    psdData.initialLoad.tiles.forEach((tileData: any) => {
      placeTiles(scene, tileData, plugin, tileSliceSize, group, () => {}, psdKey);
    });

    // Place sprites
    psdData.initialLoad.sprites.forEach((spriteData: any) => {
      placeSprites(scene, spriteData, plugin, group, () => {}, psdKey);
    });

    // Place zones
    psdData.initialLoad.zones.forEach((zoneData: any) => {
      placeZones(scene, zoneData, plugin, group, () => {}, psdKey);
    });

    // Place points
    psdData.initialLoad.points.forEach((pointData: any) => {
      placePoints(scene, pointData, plugin, group, () => {}, psdKey);
    });

    attachMethods(plugin, group);

    scene.events.emit('allLayersPlaced');
    return group;
  };
}