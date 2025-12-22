import PsdToPhaserPlugin from '../../PsdToPhaser';

export interface MultiplePsdConfig {
  key: string;
  path: string;
  position: {
    x: number;
    y: number;
  };
  lazyLoad?: boolean | string[];
}

export function loadMultiple(plugin: PsdToPhaserPlugin) {
  return function(scene: Phaser.Scene, configs: MultiplePsdConfig[]): void {
    if (!Array.isArray(configs) || configs.length === 0) {
      console.error('loadMultiple requires an array of PSD configurations');
      return;
    }

    let totalAssetCount = 0;

    // First pass: load all JSON files to count total assets
    const jsonPromises = configs.map(config => {
      return new Promise<void>((resolve, reject) => {
        const jsonPath = `${config.path}/data.json`;
        const tempKey = `${config.key}_temp_json`;
        
        scene.load.json(tempKey, jsonPath);
        
        scene.load.once(`filecomplete-json-${tempKey}`, (_key: string, _type: string, data: any) => {
          if (data) {
            // Count assets in this PSD
            const assetCount = countAssetsInData(data, config.lazyLoad);
            totalAssetCount += assetCount;
            
            // Store the data temporarily for processing
            (config as any)._tempData = data;
            resolve();
          } else {
            console.error(`Failed to load JSON for key: ${config.key}`);
            reject(new Error(`Failed to load JSON for key: ${config.key}`));
          }
        });
        
        scene.load.once('loaderror', (file: Phaser.Loader.File) => {
          if (file.key === tempKey) {
            console.error(`Failed to load JSON file: ${jsonPath}`);
            reject(new Error(`Failed to load JSON file: ${jsonPath}`));
          }
        });
      });
    });

    // Start loading JSON files
    if (!scene.load.isLoading()) {
      scene.load.start();
    }

    // Process all PSDs after JSON files are loaded
    Promise.all(jsonPromises).then(() => {
      // Now process each PSD with position offset
      configs.forEach(config => {
        const data = (config as any)._tempData;
        
        // Apply position offset to the data
        const offsetData = applyPositionOffset(data, config.position);
        
        // Store the position offset in plugin data for later use
        const processedData = {
          original: JSON.parse(JSON.stringify(offsetData)),
          basePath: config.path,
          positionOffset: config.position,
          isMultiplePsd: true, // Flag to indicate this was loaded via loadMultiple
          initialLoad: {
            sprites: [],
            tiles: [],
            zones: [],
            points: [],
            groups: [] 
          },
          lazyLoad: {
            sprites: [],
            tiles: [],
            zones: [],
            points: [],
            groups: [] 
          }
        };

        // Process layers recursively (keep original layer names in data structure)
        processLayersRecursively(offsetData.layers, processedData, false, config.lazyLoad);
        
        plugin.setData(config.key, processedData);
        
        if (plugin.isDebugEnabled('console')) {
          console.log(`Processed multi-PSD data for key "${config.key}":`, processedData);
        }
      });

      // Now load all assets with coordinated progress tracking
      let currentLoadedAssets = 0;
      
      const updateMultiProgress = () => {
        currentLoadedAssets++;
        const progress = currentLoadedAssets / totalAssetCount;
        scene.events.emit('psdLoadProgress', progress);
        
        if (plugin.isDebugEnabled('console')) {
          console.log(`⏳ Multi-PSD Progress: ${currentLoadedAssets} of ${totalAssetCount} (${(progress * 100).toFixed(2)}%)`);
        }
        
        if (currentLoadedAssets === totalAssetCount) {
          scene.events.emit('psdLoadComplete');
          if (plugin.isDebugEnabled('console')) {
            console.log('All multi-PSD assets loaded');
          }
        }
      };

      // Load assets for each PSD
      configs.forEach(config => {
        const psdData = plugin.getData(config.key);
        loadPsdAssets(scene, config.key, psdData.initialLoad, plugin, updateMultiProgress);
      });

      if (!scene.load.isLoading()) {
        scene.load.start();
      }
    }).catch(error => {
      console.error('Failed to load multiple PSDs:', error);
    });
  };
}

function applyPositionOffset(data: any, offset: { x: number; y: number }): any {
  const offsetData = JSON.parse(JSON.stringify(data)); // Deep clone
  
  function offsetLayersRecursively(layers: any[]) {
    layers.forEach(layer => {
      layer.x += offset.x;
      layer.y += offset.y;
      
      // Handle spritesheet/atlas instances
      if (layer.instances && Array.isArray(layer.instances)) {
        layer.instances.forEach((instance: any) => {
          instance.x += offset.x;
          instance.y += offset.y;
        });
      }
      
      // Recursively offset children
      if (layer.children && Array.isArray(layer.children)) {
        offsetLayersRecursively(layer.children);
      }
    });
  }
  
  if (offsetData.layers && Array.isArray(offsetData.layers)) {
    offsetLayersRecursively(offsetData.layers);
  }
  
  return offsetData;
}

function countAssetsInData(data: any, lazyLoadOption?: boolean | string[]): number {
  let assetCount = 0;
  
  function countLayersRecursively(layers: any[], parentLazyLoad: boolean = false) {
    layers.forEach(layer => {
      let isLazyLoad = parentLazyLoad || layer.lazyLoad === true;
      
      // Apply lazyLoad option from loadMultiple parameters
      if (lazyLoadOption !== undefined) {
        if (lazyLoadOption === true) {
          // Set all layers to lazyLoad
          isLazyLoad = true;
        } else if (Array.isArray(lazyLoadOption) && lazyLoadOption.includes(layer.name)) {
          // Set specific layers to lazyLoad
          isLazyLoad = true;
        }
      }
      
      if (!isLazyLoad) {
        switch (layer.category) {
          case 'tileset':
            assetCount += (layer.columns || 1) * (layer.rows || 1);
            break;
          case 'sprite':
            if (layer.type === 'atlas') {
              assetCount++;
            } else if (layer.type === 'spritesheet') {
              assetCount += layer.frame_count || 1;
            } else {
              assetCount++;
            }
            break;
        }
      }
      
      if (layer.children && Array.isArray(layer.children)) {
        countLayersRecursively(layer.children, isLazyLoad);
      }
    });
  }
  
  if (data.layers && Array.isArray(data.layers)) {
    countLayersRecursively(data.layers);
  }
  
  return assetCount;
}

function loadPsdAssets(scene: Phaser.Scene, key: string, data: any, plugin: PsdToPhaserPlugin, updateProgress: () => void): void {
  const psdData = plugin.getData(key);
  if (!psdData || !psdData.basePath) {
    console.error(`Invalid PSD data for key: ${key}`);
    return;
  }
  
  const basePath = psdData.basePath;
  const tileSliceSize = psdData.original.tile_slice_size || 150;

  // Load tiles - use original names but with namespaced texture keys
  if (data.tiles && data.tiles.length > 0) {
    loadTilesWithNamespace(scene, data.tiles, basePath, tileSliceSize, updateProgress, plugin.isDebugEnabled('console'), [], key);
  }

  // Load single tiles - use original names but with namespaced texture keys  
  if (data.singleTiles && data.singleTiles.length > 0) {
    data.singleTiles.forEach((tileData: any) => {
      loadSingleTileWithNamespace(scene, tileData, basePath, tileSliceSize, updateProgress, plugin.isDebugEnabled('console'), key);
    });
  }

  // Load sprites - use original names but with namespaced texture keys
  if (data.sprites && data.sprites.length > 0) {
    loadSpritesWithNamespace(scene, data.sprites, basePath, updateProgress, plugin.isDebugEnabled('console'), key);
  }
}


function loadSpritesWithNamespace(
  scene: Phaser.Scene,
  sprites: any[],
  basePath: string,
  onProgress: () => void,
  debug: boolean,
  namespaceKey: string
): void {
  sprites.forEach((sprite) => {
    const originalKey = sprite.name;
    const namespacedKey = `${namespaceKey}_${originalKey}`;
    const filePath = `${basePath}/${sprite.filePath}`;
    
    const loadHandler = () => {
      onProgress();
    };

    if (sprite.type === "atlas") {
      loadAtlasWithNamespace(scene, originalKey, namespacedKey, filePath, sprite, loadHandler, debug);
    } else if (sprite.type === "spritesheet" || sprite.type === "animation") {
      loadSpritesheetWithNamespace(scene, originalKey, namespacedKey, filePath, sprite, loadHandler, debug);
    } else {
      loadImageWithNamespace(scene, originalKey, namespacedKey, filePath, loadHandler, debug);
    }
  });
}

function loadAtlasWithNamespace(
  scene: Phaser.Scene,
  _originalKey: string,
  namespacedKey: string,
  filePath: string,
  sprite: any,
  onProgress: () => void,
  debug: boolean
) {
  const atlasData: any = { frames: {} };
  Object.entries(sprite.frames).forEach(
    ([frameName, frameData]: [string, any]) => {
      atlasData.frames[frameName] = {
        frame: {
          x: frameData.x,
          y: frameData.y,
          w: frameData.width,
          h: frameData.height,
        },
        rotated: false,
        trimmed: false,
        sourceSize: { w: frameData.width, h: frameData.height },
        spriteSourceSize: {
          x: 0,
          y: 0,
          w: frameData.width,
          h: frameData.height,
        },
      };
    }
  );

  scene.load.atlas(namespacedKey, filePath, atlasData);

  const checkAtlasLoaded = () => {
    if (scene.textures.exists(namespacedKey)) {
      if (debug) {
        console.log(`🗺️ Loaded atlas: ${namespacedKey} from ${filePath}`);
      }
      scene.load.off("complete", checkAtlasLoaded);
      onProgress();
    } else {
      setTimeout(checkAtlasLoaded, 100);
    }
  };

  scene.load.on("complete", checkAtlasLoaded);
}

function loadSpritesheetWithNamespace(
  scene: Phaser.Scene,
  _originalKey: string,
  namespacedKey: string,
  filePath: string,
  sprite: any,
  onProgress: () => void,
  debug: boolean
) {
  scene.load.spritesheet(namespacedKey, filePath, {
    frameWidth: sprite.frame_width,
    frameHeight: sprite.frame_height,
  });
  scene.load.once(`filecomplete-spritesheet-${namespacedKey}`, () => {
    if (debug) {
      console.log(`💥 Loaded spritesheet: ${namespacedKey} from ${filePath}`);
    }
    for (let i = 0; i < (sprite.frame_count || 1); i++) {
      onProgress();
    }
  });
}

function loadImageWithNamespace(
  scene: Phaser.Scene,
  _originalKey: string,
  namespacedKey: string,
  filePath: string,
  onProgress: () => void,
  debug: boolean
) {
  scene.load.image(namespacedKey, filePath);
  scene.load.once(`filecomplete-image-${namespacedKey}`, () => {
    if (debug) {
      console.log(`🎑 Loaded image: ${namespacedKey} from ${filePath}`);
    }
    onProgress();
  });
}

function loadTilesWithNamespace(
  scene: Phaser.Scene,
  tiles: any[],
  basePath: string,
  tileSliceSize: number,
  onProgress: () => void,
  debug: boolean,
  remainingAssets: string[],
  namespaceKey: string
): void {
  tiles.forEach(tileset => {
    for (let col = 0; col < tileset.columns; col++) {
      for (let row = 0; row < tileset.rows; row++) {
        const originalKey = `${tileset.name}_tile_${col}_${row}`;
        const namespacedKey = `${namespaceKey}_${originalKey}`;
        remainingAssets.push(namespacedKey);

        const tileData = {
          tilesetName: tileset.name,
          col,
          row,
          filetype: tileset.filetype
        };

        loadSingleTileWithNamespace(
          scene,
          tileData,
          basePath,
          tileSliceSize,
          () => {
            const index = remainingAssets.indexOf(namespacedKey);
            if (index > -1) {
              remainingAssets.splice(index, 1);
            }
            onProgress();
          },
          debug,
          namespaceKey
        );
      }
    }
  });
}

function loadSingleTileWithNamespace(
  scene: Phaser.Scene,
  tileData: any,
  basePath: string,
  tileSliceSize: number,
  onComplete: () => void,
  debug: boolean,
  namespaceKey: string
): void {
  const originalKey = `${tileData.tilesetName}_tile_${tileData.col}_${tileData.row}`;
  const namespacedKey = `${namespaceKey}_${originalKey}`;
  const filePath = `${basePath}/tiles/${tileData.tilesetName}/${tileSliceSize}/${originalKey}.${tileData.filetype || 'png'}`;

  if (!scene.textures.exists(namespacedKey)) {
    scene.load.image(namespacedKey, filePath);

    scene.load.once(`filecomplete-image-${namespacedKey}`, () => {
      onComplete();
      if (debug) {
        console.log(`🧩 Loaded tile: ${namespacedKey} from ${filePath}`);
      }
    });
  } else {
    onComplete();
    if (debug) {
      console.log(`Tile already loaded: ${namespacedKey}`);
    }
  }
}

function processLayersRecursively(layers: any[], processedData: any, parentLazyLoad: boolean, lazyLoadOption?: boolean | string[]) {
  layers.forEach((layer: any) => {
    let isLazyLoad = parentLazyLoad || layer.lazyLoad === true;
    
    // Apply lazyLoad option from loadMultiple parameters
    if (lazyLoadOption !== undefined) {
      if (lazyLoadOption === true) {
        // Set all layers to lazyLoad
        isLazyLoad = true;
      } else if (Array.isArray(lazyLoadOption) && lazyLoadOption.includes(layer.name)) {
        // Set specific layers to lazyLoad
        isLazyLoad = true;
      }
    }
    
    const targetArray = isLazyLoad ? processedData.lazyLoad : processedData.initialLoad;

    switch (layer.category) {
      case 'tileset':
        targetArray.tiles.push(layer);
        break;
      case 'sprite':
        targetArray.sprites.push(layer);
        break;
      case 'zone':
        targetArray.zones.push(layer);
        break;
      case 'point':
        targetArray.points.push(layer);
        break;
      case 'group':
        targetArray.groups.push(layer);
        if (Array.isArray(layer.children)) {
          processLayersRecursively(layer.children, processedData, isLazyLoad, lazyLoadOption);
        }
        break;
    }
  });
}