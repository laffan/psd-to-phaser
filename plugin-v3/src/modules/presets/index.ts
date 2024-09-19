import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';
import { fillZone } from './functions/fillZone';

export default function presetsModule(plugin: PsdToPhaserPlugin) {
  return {
    fillZone: fillZone(plugin),
    // Add other presets here as they are implemented
  };
}