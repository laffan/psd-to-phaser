// src/modules/shared/attachedMethods/index.ts

import PsdToPhaserPlugin from '../../../PsdToPhaserPlugin';
import attachSpriteMethods from './spriteMethods';
import { attachRemoveMethod } from './remove';
// import { attachCopyMethod } from './target';
import { attachTargetMethod } from './target';

export function attachMethods(plugin: PsdToPhaserPlugin, gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group): void {
  attachSpriteMethods(plugin, gameObject);
  attachRemoveMethod(plugin, gameObject);
  // attachCopyMethod(plugin, gameObject);
  attachTargetMethod(plugin, gameObject);
}