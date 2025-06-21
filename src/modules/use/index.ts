import PsdToPhaserPlugin from "../../PsdToPhaser";
import { button } from "./functions/button";
import { fillZone } from "./functions/fillZone";
import { joystick } from "./functions/joystick";
import { panTo } from "./functions/panTo";
import { parallax } from "./functions/parallax";

export default function useModule(plugin: PsdToPhaserPlugin): {
  button: ReturnType<typeof button>;
  fillZone: ReturnType<typeof fillZone>;
  joystick: ReturnType<typeof joystick>;
  panTo: ReturnType<typeof panTo>;
  parallax: ReturnType<typeof parallax>;
} {
  return {
    button: button(plugin),
    fillZone: fillZone(plugin),
    joystick: joystick(plugin),
    panTo: panTo(plugin),
    parallax: parallax(plugin),
  };
}
