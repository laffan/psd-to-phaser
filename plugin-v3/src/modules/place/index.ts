// src/modules/place/index.ts

import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';
import { attachMethods, preserveOriginalMethods } from '../shared/attachMethods';

export default function placeModule(plugin: PsdToPhaserPlugin) {
  return function place(scene: Phaser.Scene, psdKey: string, layerPath: string, options: { depth?: number } = {}): Phaser.GameObjects.GameObject | Phaser.GameObjects.Group {
    const psdData = plugin.getData(psdKey);
    if (!psdData) {
      console.error(`No data found for key: ${psdKey}`);
      return scene.add.group();
    }

    const tileSliceSize = psdData.tile_slice_size || 150;
    const group = scene.add.group();

    const targetLayer = findLayer(psdData.layers, layerPath.split('/'));
    if (!targetLayer) {
      console.error(`No layer found with path: ${layerPath}`);
      return group;
    }

    const placedObject = placeLayerImmediately(scene, targetLayer, plugin, tileSliceSize, group, psdKey, options);
    attachMethods(plugin, placedObject);
    
    scene.events.emit('layerPlaced', layerPath);
    
    return placedObject;
  };
}

function findLayer(layers: any[], pathParts: string[]): any {
  if (pathParts.length === 0) return layers;
  const [current, ...rest] = pathParts;
  const found = layers.find((layer: any) => layer.name === current);
  if (!found) return null;
  if (rest.length === 0) return found;
  return findLayer(found.children || [], rest);
}

function placeLayerImmediately(
  scene: Phaser.Scene,
  layer: any,
  plugin: PsdToPhaserPlugin,
  tileSliceSize: number,
  group: Phaser.GameObjects.Group,
  psdKey: string,
  options: { depth?: number }
): Phaser.GameObjects.GameObject | Phaser.GameObjects.Group {
  if (layer.category === 'group') {
    const newGroup = scene.add.group();
    preserveOriginalMethods(newGroup);
    if (Array.isArray(layer.children) && (options.depth === undefined || options.depth > 0)) {
      layer.children.forEach((child: any) => {
        const childObject = placeLayerImmediately(scene, child, plugin, tileSliceSize, newGroup, psdKey, {
          ...options,
          depth: options.depth !== undefined ? options.depth - 1 : undefined
        });
        if (childObject instanceof Phaser.GameObjects.GameObject) {
          newGroup.add(childObject);
        }
      });
    }
    group.add(newGroup);
    return newGroup;
  } else {
    let placedObject: Phaser.GameObjects.GameObject | null = null;
    switch (layer.category) {
      case 'tileset':
        placedObject = placeTiles(scene, layer, plugin, tileSliceSize, group, psdKey);
        break;
      case 'sprite':
        placedObject = placeSprites(scene, layer, plugin, group, psdKey);
        break;
      case 'zone':
        placedObject = placeZones(scene, layer, plugin, group, psdKey);
        break;
      case 'point':
        placedObject = placePoints(scene, layer, plugin, group, psdKey);
        break;
      default:
        console.error(`Unknown layer category: ${layer.category}`);
    }
    return placedObject || group;
  }
}

function placeTiles(scene: Phaser.Scene, layer: any, plugin: PsdToPhaserPlugin, tileSliceSize: number, group: Phaser.GameObjects.Group, psdKey: string): Phaser.GameObjects.GameObject {
  const tilesGroup = scene.add.group();
  
  for (let col = 0; col < layer.columns; col++) {
    for (let row = 0; row < layer.rows; row++) {
      const x = layer.x + col * tileSliceSize;
      const y = layer.y + row * tileSliceSize;
      const key = `${layer.name}_tile_${col}_${row}`;

      if (scene.textures.exists(key)) {
        const tile = scene.add.image(x, y, key);
        tile.setOrigin(0, 0);
        tile.setDepth(layer.initialDepth || 0);
        tilesGroup.add(tile);
      }
    }
  }

  group.add(tilesGroup);
  return tilesGroup;
}

function placeSprites(scene: Phaser.Scene, layer: any, plugin: PsdToPhaserPlugin, group: Phaser.GameObjects.Group, psdKey: string): Phaser.GameObjects.GameObject {
  let sprite: Phaser.GameObjects.Sprite;

  if (layer.type === 'atlas') {
    sprite = scene.add.sprite(layer.x, layer.y, layer.name, layer.frame);
  } else if (layer.type === 'animation') {
    sprite = scene.add.sprite(layer.x, layer.y, layer.name);
    if (scene.anims.exists(layer.name)) {
      sprite.play(layer.name);
    }
  } else {
    sprite = scene.add.sprite(layer.x, layer.y, layer.name);
  }

  sprite.setOrigin(0, 0);
  sprite.setDepth(layer.initialDepth || 0);

  if (layer.alpha !== undefined) sprite.setAlpha(layer.alpha);
  if (layer.visible !== undefined) sprite.setVisible(layer.visible);

  group.add(sprite);
  return sprite;
}

function placeZones(scene: Phaser.Scene, layer: any, plugin: PsdToPhaserPlugin, group: Phaser.GameObjects.Group, psdKey: string): Phaser.GameObjects.GameObject {
  let zone: Phaser.GameObjects.Zone;

  if (layer.subpaths && layer.subpaths.length > 0) {
    const points = layer.subpaths[0].map((point: number[]) => new Phaser.Math.Vector2(point[0], point[1]));
    const polygon = new Phaser.Geom.Polygon(points);
    const bounds = polygon.getBounds();
    zone = scene.add.zone(bounds.x, bounds.y, bounds.width, bounds.height);
  } else {
    zone = scene.add.zone(layer.x, layer.y, layer.width, layer.height);
  }

  zone.setOrigin(0, 0);
  zone.setDepth(layer.initialDepth || 0);

  Object.keys(layer).forEach((key) => {
    if (!["name", "subpaths", "bbox", "children"].includes(key)) {
      zone.setData(key, layer[key]);
    }
  });

  group.add(zone);
  return zone;
}

function placePoints(scene: Phaser.Scene, layer: any, plugin: PsdToPhaserPlugin, group: Phaser.GameObjects.Group, psdKey: string): Phaser.GameObjects.GameObject {
  const point = new Phaser.GameObjects.GameObject(scene, 'point');
  point.setData('x', layer.x);
  point.setData('y', layer.y);
  point.setData('name', layer.name);

  Object.keys(layer).forEach((key) => {
    if (!["name", "x", "y", "children"].includes(key)) {
      point.setData(key, layer[key]);
    }
  });

  group.add(point);
  return point;
}