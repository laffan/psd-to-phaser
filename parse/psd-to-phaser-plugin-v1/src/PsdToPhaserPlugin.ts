import Phaser from 'phaser';
import loadModule from './modules/load/index';
import pointsModule from './modules/types/points/index';
import zonesModule from './modules/types/zones/index';

export default class PsdToPhaserPlugin extends Phaser.Plugins.BasePlugin {
    private psdData: Record<string, any> = {};
    public options: { debug: boolean } = { debug: false };
    public load: ReturnType<typeof loadModule>;
    public points: ReturnType<typeof pointsModule>;
    public zones: ReturnType<typeof zonesModule>;

    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);
        this.load = loadModule(this);
        this.points = pointsModule(this);
        this.zones = zonesModule(this);
    }

    init(options: { debug?: boolean } = {}): void {
        this.options = { ...this.options, ...options };

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