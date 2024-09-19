import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';
import { fillZone } from './functions/fillZone';
import { joystick } from './functions/joystick';
import { panTo } from './functions/panTo';

export default function useModule(plugin: PsdToPhaserPlugin) {
  return {
    fillZone: fillZone(plugin),
    joystick: joystick(plugin),
    panTo: panTo(plugin),
  };
}