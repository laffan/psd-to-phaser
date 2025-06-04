import PsdToPhaserPlugin from '../../PsdToPhaser';
import { processJSON } from './processJSON';
import { loadMultiple, MultiplePsdConfig } from './loadMultiple';

export interface LoadOptions {
  lazyLoad?: boolean | string[];
}

export default function loadModule(plugin: PsdToPhaserPlugin) {
  return {
    load(scene: Phaser.Scene, key: string, psdFolderPath: string, options?: LoadOptions): void {
      const jsonPath = `${psdFolderPath}/data.json`;

      scene.load.json(key, jsonPath);

      scene.load.once(`filecomplete-json-${key}`, (_key: string, _type: string, data: any) => {
        if (data) {
          processJSON(scene, key, data, psdFolderPath, plugin, options);
        } else {
          console.error(`Loaded JSON is empty or invalid for key: ${key}`);
        }
      });

      scene.load.once('loaderror', (file: Phaser.Loader.File) => {
        if (file.key === key) {
          console.error(`Failed to load JSON file: ${jsonPath}`);
        }
      });

      if (!scene.load.isLoading()) {
        scene.load.start();
      }
    },
    loadMultiple: loadMultiple(plugin) as (scene: Phaser.Scene, configs: MultiplePsdConfig[]) => void
  };
}