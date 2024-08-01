export class StorageManager {
  private storage: Record<string, any> = {};

  store(key: string, data: any): void {
    this.storage[key] = data;
  }

  get(key: string): any {
    return this.storage[key];
  }
}