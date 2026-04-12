/**
 * Remove method – enables destroying placed items by path, with optional
 * depth limiting.
 *
 * @module shared/attachedMethods/remove
 *
 * @example
 * ```js
 * const group = this.P2P.place(this, "psd_key", "placedGroup");
 *
 * // Remove only immediate children of innerGroup
 * group.remove("innerGroup", { depth: 1 });
 *
 * // Remove innerGroup and all descendants
 * group.remove("innerGroup");
 * ```
 */

import PsdToPhaserPlugin from "../../../PsdToPhaser";

/**
 * Create the `remove()` method implementation.
 *
 * Supports two call signatures:
 * - `remove("path", { depth })` – find and destroy a specific descendant
 * - `remove({ depth })` – destroy the object itself (with depth limit)
 *
 * @param _plugin - Plugin instance (unused, reserved for consistency)
 * @returns The `remove()` function to be bound to a game object
 *
 * @internal
 */
export function createRemoveMethod(_plugin: PsdToPhaserPlugin) {
  return function remove(
    this: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group,
    pathOrOptions?: string | { depth?: number },
    options: { depth?: number } = {}
  ): boolean {
    let path: string | undefined;
    let depth: number = Infinity;

    if (typeof pathOrOptions === "string") {
      path = pathOrOptions;
      depth = options.depth !== undefined ? options.depth : Infinity;
    } else if (typeof pathOrOptions === "object") {
      depth =
        pathOrOptions.depth !== undefined ? pathOrOptions.depth : Infinity;
    }

    let removed = false;

    const safeRemove = (
      obj: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group,
      currentDepth: number = 0
    ) => {
      if (currentDepth >= depth) {
        return;
      }

      if (obj instanceof Phaser.GameObjects.Group) {
        obj
          .getChildren()
          .forEach((child) => safeRemove(child, currentDepth + 1));

        if (currentDepth === depth) {
          obj.clear();
          removed = true;
          return;
        }
      }

      if ("parentContainer" in obj && obj.parentContainer) {
        obj.parentContainer.remove(obj);
      } else if (obj.scene) {
        obj.scene.children.remove(obj);
      }

      if (typeof obj.destroy === "function") {
        obj.destroy(true);
      }

      removed = true;
    };

    const findAndRemove = (
      obj: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group,
      pathParts: string[]
    ): boolean => {
      if (pathParts.length === 0) {
        safeRemove(obj);
        return true;
      }

      if (obj instanceof Phaser.GameObjects.Group) {
        const targetName = pathParts[0];
        const targetChild = obj
          .getChildren()
          .find((child) => child.name === targetName);

        if (targetChild) {
          return findAndRemove(targetChild, pathParts.slice(1));
        }
      }

      return false;
    };

    if (path) {
      const pathParts = path.split("/");
      removed = findAndRemove(this, pathParts);
    } else {
      safeRemove(this);
    }

    if (!removed) {
      console.warn(`Object not found or already removed: ${path || "root"}`);
    }

    return removed;
  };
}

/**
 * Attach the `remove()` method to a placed game object or group.
 *
 * @param plugin - Plugin instance
 * @param gameObject - The placed object to enhance
 *
 * @internal
 */
export function attachRemoveMethod(
  plugin: PsdToPhaserPlugin,
  gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group
): void {
  (gameObject as any).remove = createRemoveMethod(plugin);
}
