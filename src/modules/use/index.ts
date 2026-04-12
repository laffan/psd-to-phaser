/**
 * Presets module – provides ready-made interaction patterns built on top
 * of placed PSD objects.
 *
 * Access via `this.P2P.use.<preset>()`:
 * - {@link button} – interactive buttons with visual states
 * - {@link fillZone} – randomly fill a zone with sprites
 * - {@link joystick} – virtual joystick with control modes
 * - {@link panTo} – animated camera panning
 * - {@link parallax} – parallax scrolling effect
 *
 * @module use
 */

import PsdToPhaserPlugin from "../../PsdToPhaser";
import { button } from "./functions/button";
import { fillZone } from "./functions/fillZone";
import { joystick } from "./functions/joystick";
import { panTo } from "./functions/panTo";
import { parallax } from "./functions/parallax";

/**
 * Factory that creates the `use` namespace with all preset functions.
 *
 * @param plugin - The PsdToPhaser plugin instance
 * @returns Object containing all preset functions
 *
 * @internal
 */
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
