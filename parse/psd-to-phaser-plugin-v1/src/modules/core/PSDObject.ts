/**
 * PSDObject Class
 * Represents a PSD object with various properties and methods for handling PSD data.
 * 
 * @class
 * @property {PSDObject | null} parent - The parent PSDObject, if any.
 * @property {PSDObject[]} children - Array of child PSDObjects.
 * @property {boolean} lazyLoad - Whether the object should be lazy loaded.
 * @property {boolean} isLoaded - Whether the object has been loaded.
 * @property {Object} bbox - Bounding box information.
 * 
 * @method constructor
 * @param {Object} data - The data to initialize the PSDObject with.
 * @param {PSDObject | null} parent - The parent PSDObject, if any.
 * 
 * @method isStandardProp
 * @param {string} prop - The property to check.
 * @return {boolean} - Whether the property is a standard property.
 * 
 * @method getCustomAttributes
 * @return {Object} - An object containing all custom attributes.
 * 
 * @method createDebugBox
 * @param {Phaser.Scene} scene - The Phaser scene.
 * @param {string} type - The type of debug box to create.
 * @param {Object} plugin - The plugin instance.
 * @param {Object} options - Additional options for creating the debug box.
 * @return {Phaser.GameObjects.Graphics | null} - The created debug graphics object, or null.
 * 
 * @method getPath
 * @return {string} - The full path of the PSDObject.
 * 
 * @method findByPath
 * @param {string} path - The path to search for.
 * @return {PSDObject | null} - The found PSDObject, or null if not found.
 */

export class PSDObject {
    constructor(data: any, parent: PSDObject | null = null) {
        Object.assign(this, data);
    }
}

export function createPSDObject(data: any): PSDObject {
    return new PSDObject(data);
}
