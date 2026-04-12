/**
 * Attached methods orchestrator – wires up all runtime helper methods
 * onto placed game objects and groups.
 *
 * After `place()` creates a game object, this module adds:
 * - **Sprite methods** – `setAlpha`, `setScale`, `setTint`, etc. (propagated to children)
 * - **Animation methods** – `updateAnimation()` for modifying running animations
 * - **Target method** – `target("path")` for sub-selecting within a placed group
 * - **Remove method** – `remove("path")` for destroying placed descendants
 *
 * @module shared/attachedMethods
 */

import PsdToPhaserPlugin from '../../../PsdToPhaser';
import attachSpriteMethods from './spriteMethods';
import { attachRemoveMethod } from './remove';
import { attachAnimationMethods } from './animationMethods';
// import { attachCopyMethod } from './target';
import { attachTargetMethod } from './target';

/**
 * Attach all runtime helper methods to a placed game object or group.
 *
 * @param plugin - Plugin instance
 * @param gameObject - The placed object to enhance
 *
 * @internal
 */
export function attachMethods(plugin: PsdToPhaserPlugin, gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group): void {
  attachSpriteMethods(plugin, gameObject);
  attachRemoveMethod(plugin, gameObject);
  attachAnimationMethods(plugin, gameObject);
  // attachCopyMethod(plugin, gameObject);
  attachTargetMethod(plugin, gameObject);
}