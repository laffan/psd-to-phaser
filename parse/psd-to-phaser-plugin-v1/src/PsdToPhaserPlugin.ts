import Phaser from 'phaser';
import loadModule from './modules/load/index';
import pointsModule from './modules/types/points/index';
import zonesModule from './modules/types/zones/index';
import tilesModule from './modules/types/tiles/index';

export interface DebugOptions {
  console?: boolean;
  shape?: boolean;
  label?: boolean;
}

export default class PsdToPhaserPlugin extends Phaser.Plugins.BasePlugin {
    private psdData: Record<string, any> = {};
    public options: { debug: boolean | DebugOptions } = { debug: false };
    public load: ReturnType<typeof loadModule>;
    public points: ReturnType<typeof pointsModule>;
    public zones: ReturnType<typeof zonesModule>;
    public tiles: ReturnType<typeof tilesModule>;

    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);
        this.load = loadModule(this);
        this.points = pointsModule(this);
        this.zones = zonesModule(this);
        this.tiles = tilesModule(this);
    }

    init(options: { debug?: boolean | DebugOptions } = {}): void {
        if (typeof options.debug === 'boolean') {
            this.options.debug = options.debug ? { shape: true } : false;
        } else {
            this.options.debug = options.debug || false;
        }

        if (this.options.debug) {
            console.log('PsdToPhaserPlugin initialized with options:', this.options);
        }
    }

    getData(key: string): any {
        return this.psdData[key];
    }

    setData(key: string, data: any): void {
        this.psdData[key] = data;
    }
}