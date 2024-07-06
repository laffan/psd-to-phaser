/**
 * Zones Module
 * Handles zone-related functionality for the PSD to Phaser plugin.
 * 
 * @module
 * 
 * @method place
 * @param {Phaser.Scene} scene - The Phaser scene to place the zone in.
 * @param {string} zonePath - The path of the zone in the PSD data.
 * @param {string} psdKey - The key of the PSD data.
 * @param {Object} options - Additional options for placing the zone.
 * @return {Object | null} - The placed zone object or null if not found.
 * 
 * @method placeAll
 * @param {Phaser.Scene} scene - The Phaser scene to place all zones in.
 * @param {string} psdKey - The key of the PSD data.
 * @param {Object} options - Additional options for placing the zones.
 * @return {Object[]} - Array of placed zone objects.
 * 
 * @method get
 * @param {string} psdKey - The key of the PSD data.
 * @param {string} path - The path of the zone to retrieve.
 * @return {Object | null} - The retrieved zone object or null if not found.
 * 
 * @method countZones
 * @param {Object[]} zones - Array of zone objects.
 * @return {number} - The total count of zones, including nested ones.
 */