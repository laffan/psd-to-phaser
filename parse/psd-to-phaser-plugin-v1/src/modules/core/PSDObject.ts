export class PSDObject {
    constructor(data: any, parent: PSDObject | null = null) {
        Object.assign(this, data);
    }
}

export function createPSDObject(data: any): PSDObject {
    return new PSDObject(data);
}
