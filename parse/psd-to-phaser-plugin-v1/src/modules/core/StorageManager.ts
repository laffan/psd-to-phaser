// src/modules/core/StorageManager.ts

export class StorageManager {
  private storage: Record<string, Record<string, any>> = {};

  store(psdKey: string, path: string, object: any): void {
    if (!this.storage[psdKey]) {
      this.storage[psdKey] = {};
    }
    this.storage[psdKey][path] = object;
  }

  get(psdKey: string, path?: string): any {
    if (!this.storage[psdKey]) {
      return null;
    }
    if (!path) {
      return this.storage[psdKey][""];
    }
    return this.findNestedObject(this.storage[psdKey][""], path);
  }

  getAll(psdKey: string, options: { depth?: number } = {}): any[] {
    if (!this.storage[psdKey]) {
      return [];
    }
    const rootContainer = this.storage[psdKey][""];
    if (!rootContainer) {
      return [];
    }
    return this.getAllNestedObjects(rootContainer, options.depth);
  }

  getTexture(psdKey: string, spritePath: string): any {
    const sprite = this.get(psdKey, spritePath);
    return sprite ? sprite.texture : null;
  }

  private findNestedObject(container: Phaser.GameObjects.Container, path: string): any {
    const parts = path.split('/');
    let current: any = container;
    for (const part of parts) {
      if (!current) return null;
      current = current.getByName(part);
    }
    return current;
  }

  private getAllNestedObjects(container: Phaser.GameObjects.Container, depth: number = Infinity, currentDepth: number = 0): any[] {
    let objects: any[] = [];
    if (currentDepth >= depth) return objects;

    container.iterate((child: any) => {
      objects.push(child);
      if (child instanceof Phaser.GameObjects.Container) {
        objects = objects.concat(this.getAllNestedObjects(child, depth, currentDepth + 1));
      }
    });

    return objects;
  }
}