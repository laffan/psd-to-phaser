/**
 * placeTileLayer
 * Places a single tile layer in the Phaser scene.
 * 
 * @param {Phaser.Scene} scene - The Phaser scene to place the tile layer in.
 * @param {Object} layer - The layer object containing tile placement data.
 * @param {Object} options - Additional options for placing the tile layer.
 * @return {Object} - An object containing the placed tile layer and related data.
 * 
 * @property {Object} layerData - The original layer data.
 * @property {Phaser.GameObjects.Container} tileLayer - The container holding all placed tiles.
 * @property {Phaser.GameObjects.Graphics | null} debugGraphics - Debug graphics for the tile layer, if enabled.
 */