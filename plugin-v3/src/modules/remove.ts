// src/modules/remove.ts

import PsdToPhaserPlugin from '../PsdToPhaserPlugin';

export default function removeModule(plugin: PsdToPhaserPlugin) {
  function remove(target: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group, options: { depth?: number } = {}): void {
    const depth = options.depth !== undefined ? options.depth : Infinity;
    removeRecursively(target, depth, 0);
  }

  function removeRecursively(gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group, maxDepth: number, currentDepth: number): void {
    if (currentDepth > maxDepth) {
      return;
    }

    if (gameObject instanceof Phaser.GameObjects.Group) {
      const children = gameObject.getChildren();
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        removeRecursively(child, maxDepth, currentDepth + 1);
      }

      if (currentDepth < maxDepth) {
        gameObject.destroy(true);
      }
    } else {
      gameObject.destroy();
    }
  }

  return { remove, attachRemove };
}

export function attachRemove(plugin: PsdToPhaserPlugin, gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group): void {
  const removeFunc = (plugin as any).removeModule.remove;
  (gameObject as any).remove = (options: { depth?: number } = {}) => {
    removeFunc(gameObject, options);
  };

  if (gameObject instanceof Phaser.GameObjects.Group) {
    gameObject.getChildren().forEach(child => attachRemove(plugin, child));
  }
}