/**
 * Tiles Module
 * Handles tile-related functionality for the PSD to Phaser plugin.
 * 
 * @module
 * 
 * @method place
 * @param {Phaser.Scene} scene - The Phaser scene to place the tile layer in.
 * @param {string} layerName - The name of the tile layer to place.
 * @param {string} psdKey - The key of the PSD data.
 * @param {Object} options - Additional options for placing the tile layer.
 * @return {Object | null} - The placed tile layer object or null if not found.
 * 
 * @method placeAll
 * @param {Phaser.Scene} scene - The Phaser scene to place all tile layers in.
 * @param {string} psdKey - The key of the PSD data.
 * @param {Object} options - Additional options for placing the tile layers.
 * @return {Object[]} - Array of placed tile layer objects.
 * 
 * @method get
 * @param {string} psdKey - The key of the PSD data.
 * @param {string} layerName - The name of the tile layer to retrieve.
 * @return {Object | null} - The retrieved tile layer object or null if not found.
 * 
 * @method countTiles
 * @param {Object} tilesData - The tiles data object.
 * @return {number} - The total count of tiles across all layers.
 */