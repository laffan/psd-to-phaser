// src/modules/shared/attachedMethods/index.ts

import PsdToPhaserPlugin from '../../../PsdToPhaserPlugin';
import attachSpriteMethods from './spriteMethods';
import { attachGetMethod } from './get';
import { attachRemoveMethod } from './remove';

export function attachMethods(plugin: PsdToPhaserPlugin, gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group): void {
  attachSpriteMethods(plugin, gameObject);
  attachGetMethod(plugin, gameObject);
  attachRemoveMethod(plugin, gameObject);
}