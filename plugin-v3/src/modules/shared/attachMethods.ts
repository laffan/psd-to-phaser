// src/modules/shared/attachMethods.ts

import PsdToPhaserPlugin from '../../PsdToPhaserPlugin';

type MethodName = 'setRotation' | 'setPosition' | 'setScale' | 'setAlpha' | 'setActive' | 'setBlendMode' | 'destroy';

const methodsToAttach: MethodName[] = ['setRotation', 'setPosition', 'setScale', 'setAlpha', 'setActive', 'setBlendMode', 'destroy'];

export function attachMethods(plugin: PsdToPhaserPlugin, gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group): void {
  methodsToAttach.forEach(methodName => {
    attachMethod(plugin, gameObject, methodName);
  });

  if (gameObject instanceof Phaser.GameObjects.Group) {
    gameObject.getChildren().forEach(child => attachMethods(plugin, child));
  }
}

function attachMethod(plugin: PsdToPhaserPlugin, gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group, methodName: MethodName): void {
  if (gameObject instanceof Phaser.GameObjects.Group) {
    (gameObject as any)[methodName] = createGroupMethod(plugin, methodName);
  }
}

function createGroupMethod(plugin: PsdToPhaserPlugin, methodName: MethodName) {
  return function(this: Phaser.GameObjects.Group, ...args: any[]) {
    const options = typeof args[args.length - 1] === 'object' ? args.pop() : {};
    const depth = options.depth !== undefined ? options.depth : Infinity;
    
    applyMethodRecursively(this, methodName, args, depth, 0);
  };
}

function applyMethodRecursively(gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group, methodName: MethodName, args: any[], maxDepth: number, currentDepth: number): void {
  if (currentDepth > maxDepth) {
    return;
  }

  if (gameObject instanceof Phaser.GameObjects.Group) {
    if (currentDepth === maxDepth + 1) {
      // Apply method to the group itself if we've reached the max depth
      if (typeof (gameObject as any)[`__original_${methodName}`] === 'function') {
        (gameObject as any)[`__original_${methodName}`](...args);
      }
    } else {
      // Continue recursion for children
      const children = gameObject.getChildren();
      children.forEach(child => {
        applyMethodRecursively(child, methodName, args, maxDepth, currentDepth + 1);
      });
    }
  } else {
    // Apply method to individual game objects
    if (typeof (gameObject as any)[methodName] === 'function') {
      (gameObject as any)[methodName](...args);
    }
  }
}

// Preserve original group methods
export function preserveOriginalMethods(group: Phaser.GameObjects.Group): void {
  methodsToAttach.forEach(methodName => {
    if (typeof (group as any)[methodName] === 'function') {
      (group as any)[`__original_${methodName}`] = (group as any)[methodName];
    }
  });
}