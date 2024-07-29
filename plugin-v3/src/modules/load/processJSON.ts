import { loadAssetsFromJSON } from "./loadAssetsFromJSON";
import PsdToPhaserPlugin from "../../PsdToPhaserPlugin";

export function processJSON(
  scene: Phaser.Scene,
  key: string,
  data: any,
  psdFolderPath: string,
  plugin: PsdToPhaserPlugin
): void {
  console.log('processJSON called with key:', key);

  if (!data || !data.layers || !Array.isArray(data.layers)) {
    console.error(`Invalid or missing layers data for key: ${key}`);
    return;
  }

  const { regularTiles, lazyLoadTiles } = extractTiles(data.layers, data.tile_slice_size);
  const sprites = extractSprites(data.layers);
  const lazyLoadSprites = extractLazyLoadSprites(sprites);

  const processedData = {
    ...data,
    basePath: psdFolderPath,
    tiles: regularTiles,
    // sprites: sprites.filter(sprite => !sprite.lazyLoad),
    lazyLoadObjects: [...lazyLoadTiles, ...lazyLoadSprites],
    zones: extractZones(data.layers),
    points: extractPoints(data.layers),
  };

  plugin.setData(key, processedData);

  if (plugin.options.debug) {
    console.log(`Processed JSON for key "${key}":`, processedData);
    console.log('Regular tiles:', regularTiles.length);
    console.log('Lazy-load tiles:', lazyLoadTiles.length);
    console.log('Sprites:', sprites.length);
    console.log('Lazy-load sprites:', lazyLoadSprites.length);
    console.log('Zones:', processedData.zones.length);
    console.log('Points:', processedData.points.length);
    console.log('Lazy-load objects:', processedData.lazyLoadObjects);
  }

  loadAssetsFromJSON(scene, key, processedData, plugin);
}

function extractTiles(layers: any[], defaultTileSize: number): { regularTiles: any[], lazyLoadTiles: any[] } {
  function extractTilesRecursively(layer: any): any[] {
    let tiles = [];
    
    if (layer.category === 'tileset') {
      tiles.push({
        ...layer,
        tile_slice_size: layer.tile_slice_size || defaultTileSize,
        path: `tiles/${layer.name}/${layer.tile_slice_size || defaultTileSize}`,
        filetype: layer.filetype || 'png',
        lazyLoad: layer.lazyLoad || false
      });
    }

    if (layer.children && Array.isArray(layer.children)) {
      layer.children.forEach((child: any) => {
        tiles = tiles.concat(extractTilesRecursively(child));
      });
    }

    return tiles;
  }

  const allTiles = layers.flatMap(layer => extractTilesRecursively(layer));
  return {
    regularTiles: allTiles.filter(tile => !tile.lazyLoad),
    lazyLoadTiles: allTiles.filter(tile => tile.lazyLoad).map(tile => ({
      ...tile,
      loaded: false,
      loading: false,
      type: 'tileset'
    }))
  };
}

function extractSprites(layers: any[]): any[] {
  function extractSpritesRecursively(layer: any): any[] {
    let sprites = [];
    
    if (layer.category === 'sprite' || (layer.category === 'group' && layer.children)) {
      sprites.push(layer);
    }

    if (layer.children && Array.isArray(layer.children)) {
      layer.children.forEach((child: any) => {
        sprites = sprites.concat(extractSpritesRecursively(child));
      });
    }

    return sprites;
  }

  return layers.flatMap(layer => extractSpritesRecursively(layer));
}

function extractLazyLoadSprites(sprites: any[]): any[] {
  function extractLazyLoadSpritesRecursively(sprite: any, path: string = ""): any[] {
    let lazySprites = [];
    
    if (sprite.lazyLoad) {
      lazySprites.push({
        ...sprite,
        path,
        type: 'sprite',
        loaded: false,
        loading: false
      });
    }

    if (sprite.children && Array.isArray(sprite.children)) {
      sprite.children.forEach((child: any) => {
        const childPath = path ? `${path}/${child.name}` : child.name;
        lazySprites = lazySprites.concat(extractLazyLoadSpritesRecursively(child, childPath));
      });
    }

    return lazySprites;
  }

  return sprites.flatMap(sprite => extractLazyLoadSpritesRecursively(sprite));
}

function extractZones(layers: any[]): any[] {
  return layers.filter(layer => layer.category === 'zone');
}

function extractPoints(layers: any[]): any[] {
  return layers.filter(layer => layer.category === 'point');
}