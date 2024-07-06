import Phaser from 'phaser';
import loadModule from './modules/load/index';

export default class PsdToPhaserPlugin extends Phaser.Plugins.BasePlugin {
    private psdData: Record<string, any> = {};
    private options: { debug: boolean } = { debug: false };
    public load: ReturnType<typeof loadModule>;

    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);
    }

    init(options: { debug?: boolean } = {}): void {
        this.options = { ...this.options, ...options };
        this.load = loadModule(this);

        if (this.options.debug) {
            console.log('PsdToPhaserPlugin initialized with options:', this.options);
        }
    }

    getData(key: string): any {
        return this.psdData[key];
    }

    // Add this method to allow setting data from the load module
    setData(key: string, data: any): void {
        this.psdData[key] = data;
    }
}