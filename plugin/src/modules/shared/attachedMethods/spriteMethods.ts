// src/modules/shared/attachSpriteMethods.ts

import PsdToPhaserPlugin from '../../../PsdToPhaserPlugin';

type MethodName = string;
;

const methodsToAttach: MethodName[] = [  'setAlpha',
  'setAngle',
  'setActive',
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

export function attachIndividualMethods(plugin: PsdToPhaserPlugin, gameObject: Phaser.GameObjects.GameObject): void {
  methodsToAttach.forEach(methodName => {
    if (methodName === 'remove') {
      (gameObject as any)[methodName] = (options: { depth?: number } = {}) => {
        plugin.remove(gameObject, options);
      };
    }
  });
}


export function createGroupMethod(plugin: PsdToPhaserPlugin, methodName: MethodName) {
  return function(this: Phaser.GameObjects.Group, ...args: any[]) {
    const options = typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1]) ? args.pop() : {};
    const depth = options.depth !== undefined ? options.depth : Infinity;
    
    applyMethodRecursively(this, methodName, args, depth, 0);
  };
}

export function applyMethodRecursively(gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group, methodName: MethodName, args: any[], maxDepth: number, currentDepth: number): void {
  if (currentDepth > maxDepth) {
    return;
  }

  if (gameObject instanceof Phaser.GameObjects.Group) {
    if (currentDepth < maxDepth) {
      const children = gameObject.getChildren();
      children.forEach(child => {
        applyMethodRecursively(child, methodName, args, maxDepth, currentDepth + 1);
      });
    }
  } else if (typeof (gameObject as any)[methodName] === 'function') {
    (gameObject as any)[methodName](...args);
  }
}