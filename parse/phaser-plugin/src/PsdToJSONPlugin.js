// src/PsdToJSONPlugin.js

// import { setupLazyLoading, checkLayerVisibility } from './modules/lazyLoading';
// import { createZones } from './modules/zoneManager';
// import { createPoints } from './modules/pointManager';
// import { createBaseLayers } from './modules/utils';

export default class PsdToJSONPlugin extends Phaser.Plugins.BasePlugin {
  constructor(pluginManager) {
    super(pluginManager);
    this.psdData = [];
  }

  init() {
    this.game.events.once("destroy", this.destroy, this);
  }

  loadJSON(scene, key, filePath) {
    scene.load.json(key, filePath);
    scene.load.once("complete", () => {
      const data = scene.cache.json.get(key);
      this.processJSON(scene, key, data);
    });
  }

  processJSON(scene, key, data) {
    // Store the data in the game's registry
    scene.game.registry.set(key, data);
    console.log( scene.game.registry );
    // Also store it in the plugin for easy access
    this.psdData[key] = data;
    console.log( this.psdData );
  }

  addPsd(scene, key, psdFilename) {
    console.log(`Adding PSD: ${key} from ${psdFilename}`);

    // Retrieve the data from the registry
    const data = this.psdData[psdFilename];

    if (!data) {
      console.error(`No PSD data found for ${psdFilename}`);
      return;
    }

    const psdData = data.psds.find((psd) => psd.filename === psdFilename);

    if (!psdData) {
      console.error(`No PSD named ${psdFilename} found in the data`);
      return;
    }

    // Here you would typically process the PSD data to create game objects
    // For now, we'll just log some information
    console.log(`Adding PSD ${key}:`);
    console.log(`Dimensions: ${psdData.width}x${psdData.height}`);
    console.log(`Number of sprites: ${psdData.sprites.length}`);
    console.log(`Number of zones: ${psdData.zones.length}`);
    console.log(`Number of points: ${psdData.points.length}`);

    // You could return the processed PSD data or created game objects here
    return psdData;
  }
}
