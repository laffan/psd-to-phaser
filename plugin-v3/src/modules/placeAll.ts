import PsdToPhaserPlugin from "../PsdToPhaserPlugin";
import { placeTiles } from "./place/types/tiles";
import { placeSprites } from "./place/types/sprites";
import { placeZones } from "./place/types/zones";
import { placePoints } from "./place/types/points";
import { attachMethods } from './shared/attachedMethods';

export default function placeAllModule(plugin: PsdToPhaserPlugin) {
  return function placeAll(
    scene: Phaser.Scene,
    psdKey: string
  ): Phaser.GameObjects.Group {
    const psdData = plugin.getData(psdKey);
    if (!psdData || !psdData.initialLoad) {
      console.error(`No initialLoad data found for key: ${psdKey}`);
      return scene.add.group();
    }

    const mainGroup = scene.add.group();
    mainGroup.name = psdKey;
    const tileSliceSize = psdData.original.tile_slice_size || 150;

    function placeGroup(groupData: any, parentGroup: Phaser.GameObjects.Group) {
      const group = scene.add.group();
      group.name = groupData.name;
      parentGroup.add(group);

      attachMethods(plugin, group);

      if (Array.isArray(groupData.children)) {
        groupData.children.forEach((child: any) => {
          switch (child.category) {
            case "tileset":
              placeTiles(
                scene,
                child,
                plugin,
                tileSliceSize,
                group,
                () => {},
                psdKey
              );
              break;
            case "sprite":
              placeSprites(scene, child, plugin, group, () => {}, psdKey);
              break;
            case "zone":
              placeZones(scene, child, plugin, group, () => {}, psdKey);
              break;
            case "point":
              placePoints(scene, child, plugin, group, () => {}, psdKey);
              break;
            case "group":
              placeGroup(child, group);
              break;
          }
        });
      }

      return group;
    }

    // Place top-level groups
    psdData.initialLoad.groups.forEach((groupData: any) => {
      placeGroup(groupData, mainGroup);
    });

    // Place top-level tiles, sprites, zones, and points
    psdData.initialLoad.tiles.forEach((tileData: any) => {
      placeTiles(
        scene,
        tileData,
        plugin,
        tileSliceSize,
        mainGroup,
        () => {},
        psdKey
      );
    });

    psdData.initialLoad.sprites.forEach((spriteData: any) => {
      placeSprites(scene, spriteData, plugin, mainGroup, () => {}, psdKey);
    });

    psdData.initialLoad.zones.forEach((zoneData: any) => {
      placeZones(scene, zoneData, plugin, mainGroup, () => {}, psdKey);
    });

    psdData.initialLoad.points.forEach((pointData: any) => {
      placePoints(scene, pointData, plugin, mainGroup, () => {}, psdKey);
    });

    attachMethods(plugin, mainGroup);

    scene.events.emit("allLayersPlaced");
    return mainGroup;
  };
}
