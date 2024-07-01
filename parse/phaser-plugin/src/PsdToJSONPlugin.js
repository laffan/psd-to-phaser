import dataModule from './modules/data';
import pointsModule from './modules/points';
import spritesModule from './modules/sprites';
import tilesModule from './modules/tiles';
import zonesModule from './modules/zones';

export default class PsdToJSONPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.psdData = {};
        this.options = { debug: false }; // Default options
    }

    boot() {
        this.pluginManager.game.events.once('destroy', this.destroy, this);
    }

    init(options = {}) {
        // Merge provided options with defaults
        this.options = { ...this.options, ...options };

        // Initialize modules
        this.data = dataModule(this);
        this.points = pointsModule(this);
        this.sprites = spritesModule(this);
        this.tiles = tilesModule(this);
        this.zones = zonesModule(this);

        if (this.options.debug) {
            console.log('PsdToJSONPlugin initialized with options:', this.options);
        }
    }

    load(scene, key, psdFolderPath){
      this.data.load(scene, key, psdFolderPath)
    }
}