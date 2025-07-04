// src/modules/shared/attachedMethods/target.ts
import PsdToPhaserPlugin from '../../../PsdToPhaser';
import { attachMethods } from './index';

export function createTargetMethod(plugin: PsdToPhaserPlugin) {
  return function get(this: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group, path?: string, options: { depth?: number } = {}): Phaser.GameObjects.GameObject | Phaser.GameObjects.Group | null {
    if (!path) {
      return this;
    }
    const pathParts = path.split('/');
    const maxDepth = options.depth !== undefined ? options.depth : Infinity;

    function searchInGroup(group: Phaser.GameObjects.Group | Phaser.GameObjects.Container, currentPath: string[], currentDepth: number): Phaser.GameObjects.GameObject | Phaser.GameObjects.Group | Phaser.GameObjects.Container | null {
      if (currentDepth > maxDepth || currentPath.length === 0) {
        return null;
      }
      const [current, ...rest] = currentPath;

      let children: (Phaser.GameObjects.GameObject | Phaser.GameObjects.Group | Phaser.GameObjects.Container)[];
      if (group instanceof Phaser.GameObjects.Group) {
        children = group.getChildren();
      } else if (group instanceof Phaser.GameObjects.Container) {
        children = group.list as (Phaser.GameObjects.GameObject | Phaser.GameObjects.Group | Phaser.GameObjects.Container)[];
      } else {
        return null;
      }

      // Filter out all debug objects
      const filteredChildren = children.filter(child => !(child as any).isDebugObject);

      for (const child of filteredChildren) {
        if (child.name === current) {
          if (rest.length === 0) {
            return child;
          } else if (child instanceof Phaser.GameObjects.Group || child instanceof Phaser.GameObjects.Container) {
            return searchInGroup(child, rest, currentDepth + 1);
          }
        }
      }

      // If we haven't found a match, search in all child groups and containers
      for (const child of filteredChildren) {
        if (child instanceof Phaser.GameObjects.Group || child instanceof Phaser.GameObjects.Container) {
          const result = searchInGroup(child, currentPath, currentDepth + 1);
          if (result) return result;
        }
      }

      return null;
    }

    let result: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group | Phaser.GameObjects.Container | null = null;
    if (this instanceof Phaser.GameObjects.Group || this instanceof Phaser.GameObjects.Container) {
      result = searchInGroup(this, pathParts, 0);
    } else {
      result = this.name === pathParts[0] ? this : null;
    }
    
    if (result) {
      attachMethods(plugin, result);
    } else {
      console.warn(`Item not found at path: ${path}`);
    }
    return result;
  };
}


export function attachTargetMethod(plugin: PsdToPhaserPlugin, gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group): void {
  (gameObject as any).target = createTargetMethod(plugin);
}

