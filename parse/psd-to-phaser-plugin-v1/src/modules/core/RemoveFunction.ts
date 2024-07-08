import { WrappedObject } from '../typeDefinitions';
import { StorageManager } from './StorageManager';

export function createRemoveFunction(
    storageManager: StorageManager,
    psdKey: string,
    path: string
): (options?: { depth?: number }) => void {
    return function remove(options: { depth?: number } = {}) {
        const depth = options.depth !== undefined ? options.depth : Infinity;
        removeRecursively(this, depth);
        storageManager.remove(psdKey, path);
    };

    function removeRecursively(obj: WrappedObject, currentDepth: number) {
        if (currentDepth < 0) return;

        if (obj.children) {
            obj.children.forEach(child => removeRecursively(child, currentDepth - 1));
        }

        if (obj.placed) {
            if (obj.placed instanceof Phaser.GameObjects.Container) {
                obj.placed.removeAll(true);
            }
            obj.placed.destroy();
        }
    }
}