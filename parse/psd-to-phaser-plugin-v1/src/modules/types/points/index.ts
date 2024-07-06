/**
 * Points Module
 * Handles point-related functionality for the PSD to Phaser plugin.
 * 
 * @module
 * 
 * @method place
 * @param {Phaser.Scene} scene - The Phaser scene to place the point in.
 * @param {string} pointPath - The path of the point in the PSD data.
 * @param {string} psdKey - The key of the PSD data.
 * @param {Object} options - Additional options for placing the point.
 * @return {Object | null} - The placed point object or null if not found.
 * 
 * @method placeAll
 * @param {Phaser.Scene} scene - The Phaser scene to place all points in.
 * @param {string} psdKey - The key of the PSD data.
 * @param {Object} options - Additional options for placing the points.
 * @return {Object[]} - Array of placed point objects.
 * 
 * @method get
 * @param {string} psdKey - The key of the PSD data.
 * @param {string} path - The path of the point to retrieve.
 * @return {Object | null} - The retrieved point object or null if not found.
 * 
 * @method countPoints
 * @param {Object[]} points - Array of point objects.
 * @return {number} - The total count of points, including nested ones.
 */