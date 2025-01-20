import PsdToPhaserPlugin from "../../PsdToPhaserPlugin";
import { fillZone } from "./functions/fillZone";
import { joystick } from "./functions/joystick";
import { panTo } from "./functions/panTo";
import { parallax } from "./functions/parallax";

export default function useModule(plugin: PsdToPhaserPlugin): {
  fillZone: ReturnType<typeof fillZone>;
  joystick: ReturnType<typeof joystick>;
  panTo: ReturnType<typeof panTo>;
  parallax: ReturnType<typeof parallax>;
} {
  return {
    fillZone: fillZone(plugin),
    joystick: joystick(plugin),
    panTo: panTo(plugin),
    parallax: parallax(plugin),
  };
}
