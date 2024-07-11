import { WrappedObject } from "../typeDefinitions";
import { StorageManager } from "./StorageManager";

export function createRemoveFunction(
  storageManager: StorageManager,
  psdKey: string,
  path: string
): (options?: { depth?: number }) => void {
  return function remove(options: { depth?: number } = {}) {
    const depth = options.depth !== undefined ? options.depth : Infinity;
    const obj = storageManager.get(psdKey, path);
    if (obj) {
      removeRecursively(obj, depth, storageManager, psdKey, path);
      if (depth > 0) {
        storageManager.remove(psdKey, path);
      }
    } else {
      console.error(`Object not found for removal: ${psdKey}, ${path}`);
    }
  };

  function removeRecursively(
    obj: WrappedObject,
    currentDepth: number,
    storageManager: StorageManager,
    psdKey: string,
    path: string
  ) {
    if (currentDepth < 0 || !obj) return;

    console.log(
      `Removing object: ${obj.name} at path: ${path}, depth: ${currentDepth}`
    );

    if (Array.isArray(obj.children)) {
      for (let i = obj.children.length - 1; i >= 0; i--) {
        const child = obj.children[i];
        if (child) {
          const childPath = `${path}/${child.name}`;
          if (currentDepth > 0) {
            removeRecursively(
              child,
              currentDepth - 1,
              storageManager,
              psdKey,
              childPath
            );
            obj.children.splice(i, 1);
            storageManager.remove(psdKey, childPath);
          } else if (!(child.placed instanceof Phaser.GameObjects.Group)) {
            child.placed.destroy();
            obj.children.splice(i, 1);
            storageManager.remove(psdKey, childPath);
          }
        }
      }
    }

    if (currentDepth > 0) {
      if (obj.placed instanceof Phaser.GameObjects.Group) {
        obj.placed.destroy(true);
      } else if (obj.placed) {
        obj.placed.destroy();
      }
      storageManager.remove(psdKey, path);
    } else {
      // Update the stored object to reflect removed children
      storageManager.store(psdKey, path, obj);
    }
  }
}