// src/modules/shared/attachedMethods/index.ts

import PsdToPhaserPlugin from '../../../PsdToPhaser';
import attachSpriteMethods from './spriteMethods';
import { attachRemoveMethod } from './remove';
import { attachAnimationMethods } from './animationMethods';
// import { attachCopyMethod } from './target';
import { attachTargetMethod } from './target';

export function attachMethods(plugin: PsdToPhaserPlugin, gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group): void {
  attachSpriteMethods(plugin, gameObject);
  attachRemoveMethod(plugin, gameObject);
  attachAnimationMethods(plugin, gameObject);
  // attachCopyMethod(plugin, gameObject);
  attachTargetMethod(plugin, gameObject);
}