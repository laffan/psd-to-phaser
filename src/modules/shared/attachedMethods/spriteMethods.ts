/**
 * Sprite method attachment – adds Phaser sprite methods to placed groups
 * so they propagate recursively to all child game objects.
 *
 * Supported methods: `setActive`, `setAlpha`, `setAngle`, `setBlendMode`,
 * `setDepth`, `setDisplaySize`, `setFlip`, `setOrigin`, `setPosition`,
 * `setRotation`, `setScale`, `setScrollFactor`, `setSize`, `setTint`,
 * `setVisible`, `setX`, `setY`, `setZ`.
 *
 * **Phaser 4 note:** `setMask` and `setPipeline` have been removed.
 * Masks use the Filter system; pipelines are replaced by RenderNodes.
 *
 * @module shared/attachedMethods/spriteMethods
 */

import PsdToPhaserPlugin from '../../../PsdToPhaser';

type MethodName = string;

/**
 * The list of Phaser sprite methods that are attached to placed groups.
 * When called on a group, these methods propagate recursively to all children.
 *
 * @example
 * ```js
 * const group = this.P2P.place(this, "psd_key", "depthTest");
 * group.setAlpha(0.3);       // applies to all children
 * group.setRotation(Math.PI / 4);
 * ```
 */
const methodsToAttach: MethodName[] = [
  'setAlpha',
  'setAngle',
  'setActive',
  'setBlendMode',
  'setDepth',
  'setDisplaySize',
  'setFlip',
  'setOrigin',
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

/**
 * Attach sprite manipulation methods to a placed game object or group.
 *
 * For groups, each method is replaced with a version that recursively
 * applies the call to all children. For individual game objects,
 * only the `remove` method is overridden.
 *
 * @param plugin - Plugin instance
 * @param gameObject - The placed object to enhance
 *
 * @internal
 */
export default function attachSpriteMethods(plugin: PsdToPhaserPlugin, gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group): void {
  if (gameObject instanceof Phaser.GameObjects.Group) {
    attachGroupMethods(plugin, gameObject);
  } else {
    attachIndividualMethods(plugin, gameObject);
  }
}

/**
 * Replace each sprite method on a group with a recursive version.
 * @internal
 */
export function attachGroupMethods(plugin: PsdToPhaserPlugin, group: Phaser.GameObjects.Group): void {
  methodsToAttach.forEach(methodName => {
    (group as any)[methodName] = createGroupMethod(plugin, methodName);
  });
}

/**
 * Attach method overrides for individual (non-group) game objects.
 * @internal
 */
export function attachIndividualMethods(_plugin: PsdToPhaserPlugin, gameObject: Phaser.GameObjects.GameObject): void {
  methodsToAttach.forEach(methodName => {
    if (methodName === 'remove') {
      (gameObject as any)[methodName] = (_options: { depth?: number } = {}) => {
        gameObject.removedFromScene()
      };
    }
  });
}


/**
 * Create a group method that recursively applies a sprite method to children.
 * An optional trailing `{ depth }` object limits how deep the recursion goes.
 * @internal
 */
export function createGroupMethod(_plugin: PsdToPhaserPlugin, methodName: MethodName) {
  return function(this: Phaser.GameObjects.Group, ...args: any[]) {
    const options = typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1]) ? args.pop() : {};
    const depth = options.depth !== undefined ? options.depth : Infinity;
    
    applyMethodRecursively(this, methodName, args, depth, 0);
  };
}

/**
 * Recursively walk a group tree and apply a method to every leaf game object.
 * @internal
 */
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