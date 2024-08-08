// src/modules/shared/attachSpriteMethods.ts

import PsdToPhaserPlugin from '../../../PsdToPhaserPlugin';
import { createGroupMethod, attachIndividualMethods  } from "./shared"

type MethodName = string;
;

const methodsToAttach: MethodName[] = [  'setAlpha',
  'setAngle',
  'setBlendMode',
  'setDepth',
  'setDisplaySize',
  'setFlip',
  'setMask',
  'setOrigin',
  'setPipeline',
  'setPosition',
  'setRotation',
  'setScale',
  'setScrollFactor',
  'setSize',
  'setTint',
  'setVisible',
  'setX',
  'setY',
  'setZ',
];

export default function attachSpriteMethods(plugin: PsdToPhaserPlugin, gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group): void {
  if (gameObject instanceof Phaser.GameObjects.Group) {
    attachGroupMethods(plugin, gameObject);
  } else {
    attachIndividualMethods(plugin, gameObject);
  }
}

export function attachGroupMethods(plugin: PsdToPhaserPlugin, group: Phaser.GameObjects.Group): void {
  methodsToAttach.forEach(methodName => {
    (group as any)[methodName] = createGroupMethod(plugin, methodName);
  });
}