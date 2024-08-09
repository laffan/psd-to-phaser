// src/modules/shared/attachedMethods/get.ts

import PsdToPhaserPlugin from '../../../PsdToPhaserPlugin';
import { attachMethods } from './index';

export function createGetMethod(plugin: PsdToPhaserPlugin) {
  return function get(this: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group, path: string, options: { depth?: number, destroyOriginal?: boolean } = {}): Phaser.GameObjects.GameObject | Phaser.GameObjects.Group | null {
    const pathParts = path.split('/');
    const maxDepth = options.depth !== undefined ? options.depth : Infinity;
    const destroyOriginal = options.destroyOriginal !== undefined ? options.destroyOriginal : true;

    function searchInGroup(group: Phaser.GameObjects.Group, currentPath: string[], currentDepth: number): Phaser.GameObjects.GameObject | Phaser.GameObjects.Group | null {
      if (currentDepth > maxDepth || currentPath.length === 0) {
        return null;
      }

      const [current, ...rest] = currentPath;
      
      for (let i = group.getChildren().length - 1; i >= 0; i--) {
        const child = group.getChildren()[i];
        if (child.name === current) {
          if (rest.length === 0) {
            if (destroyOriginal) {
              group.remove(child);
            }
            return child;
          } else if (child instanceof Phaser.GameObjects.Group) {
            return searchInGroup(child, rest, currentDepth + 1);
          }
        }
      }

      return null;
    }

    let result: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group | null = null;

    if (this instanceof Phaser.GameObjects.Group) {
      result = searchInGroup(this, pathParts, 0);
    } else if (this.name === pathParts[0] && pathParts.length === 1) {
      result = this;
      if (destroyOriginal) {
        if (this.parentContainer) {
          this.parentContainer.remove(this);
        } else if (this.scene) {
          this.scene.children.remove(this);
        }
      }
    }

    if (result) {
      attachMethods(plugin, result);
    } else {
      console.warn(`Item not found at path: ${path}`);
    }

    return result;
  };
}

export function attachGetMethod(plugin: PsdToPhaserPlugin, gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group): void {
  (gameObject as any).get = createGetMethod(plugin);
}