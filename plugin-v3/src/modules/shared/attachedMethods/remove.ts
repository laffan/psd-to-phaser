// src/modules/shared/attachedMethods/remove.ts

import PsdToPhaserPlugin from '../../../PsdToPhaserPlugin';

export function createRemoveMethod(plugin: PsdToPhaserPlugin) {
  return function remove(this: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group, options: { depth?: number } = {}): boolean {
    let removed = false;
    const maxDepth = options.depth !== undefined ? options.depth : Infinity;

    const safeRemove = (obj: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group, currentDepth: number = 0) => {
      if (currentDepth > maxDepth) {
        return;
      }

      if (obj instanceof Phaser.GameObjects.Group) {
        obj.getChildren().forEach(child => safeRemove(child, currentDepth + 1));
        
        // If we're at maxDepth - 1, don't remove the group itself, just clear its children
        if (currentDepth === maxDepth) {
          obj.clear();
          removed = true;
          return;
        }
      }

      if (obj.parentContainer) {
        obj.parentContainer.remove(obj);
      } else if (obj.scene) {
        obj.scene.children.remove(obj);
      }

      if (typeof obj.destroy === 'function') {
        obj.destroy(true);
      }

      removed = true;
    };

    safeRemove(this);

    return removed;
  };
}

export function attachRemoveMethod(plugin: PsdToPhaserPlugin, gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group): void {
  (gameObject as any).remove = createRemoveMethod(plugin);
}