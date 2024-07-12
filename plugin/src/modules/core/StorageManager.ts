// src/modules/core/StorageManager.ts

import { WrappedObject } from "../typeDefinitions";

export class StorageManager {
  private storage: Record<string, Record<string, WrappedObject>> = {};

  store(psdKey: string, path: string, object: WrappedObject): void {
    if (!this.storage[psdKey]) {
      this.storage[psdKey] = {};
    }
    this.storage[psdKey][path] = object;
  }

get(psdKey: string, path?: string): WrappedObject | null {
  if (!this.storage[psdKey]) {
    console.log(`No storage found for key: ${psdKey}`);
    return null;
  }
  if (!path) {
    console.log(`Returning root object for key: ${psdKey}`);
    return this.storage[psdKey][""];
  }
  // First, try to get the object directly
  if (this.storage[psdKey][path]) {
    return this.storage[psdKey][path];
  }
  // If not found, try to find it in the nested structure
  return this.findNestedObject(this.storage[psdKey][""], path);
}

private findNestedObject(
  wrappedObject: WrappedObject,
  path: string
): WrappedObject | null {
  const parts = path.split("/");
  let current: WrappedObject | null = wrappedObject;
  for (const part of parts) {
    if (!current) return null;
    if (current.type === "LazyLoadPlaceholder") {
      // For lazy-loaded objects, return the placeholder
      return current;
    }
    if (!current.children) return null;
    current = current.children.find((child) => child.name === part) || null;
  }
  return current;
}

  remove(psdKey: string, path: string): void {
    if (this.storage[psdKey]) {
      delete this.storage[psdKey][path];
      console.log(`Removed from storage: ${psdKey}, ${path}`);
    } else {
      console.log(`Nothing to remove at: ${psdKey}, ${path}`);
    }
  }

  getAll(psdKey: string, options: { depth?: number } = {}): WrappedObject[] {
    if (!this.storage[psdKey]) {
      return [];
    }
    const rootObject = this.storage[psdKey][""];
    if (!rootObject) {
      return [];
    }
    return this.getAllNestedObjects(rootObject, options.depth);
  }



  private getAllNestedObjects(
    wrappedObject: WrappedObject,
    depth: number = Infinity,
    currentDepth: number = 0
  ): WrappedObject[] {
    let objects: WrappedObject[] = [wrappedObject];
    if (currentDepth >= depth || !wrappedObject.children) return objects;

    wrappedObject.children.forEach((child) => {
      objects = objects.concat(
        this.getAllNestedObjects(child, depth, currentDepth + 1)
      );
    });

    return objects;
  }

addToGroup(psdKey: string, parentPath: string, childObject: WrappedObject): void {
  const parentGroup = this.get(psdKey, parentPath);
  
  if (parentGroup && parentGroup.placed instanceof Phaser.GameObjects.Group) {
    parentGroup.placed.add(childObject.placed);
    if (!parentGroup.children) {
      parentGroup.children = [];
    }
    parentGroup.children.push(childObject);
    this.store(psdKey, `${parentPath}/${childObject.name}`, childObject);
  } else if (parentGroup && parentGroup.type === "LazyLoadPlaceholder") {
    // For lazy-loaded parent, just store the child object
    this.store(psdKey, `${parentPath}/${childObject.name}`, childObject);
  } else if (!parentGroup) {
    // If parent group is not found, it might be a lazy-loaded item
    // Just store the child object at its path
    this.store(psdKey, `${parentPath}/${childObject.name}`, childObject);
  } else {
    console.warn(`Parent group not found or invalid for ${parentPath}, storing child separately`);
    this.store(psdKey, `${parentPath}/${childObject.name}`, childObject);
  }
}
}