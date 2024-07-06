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


import PsdToPhaserPlugin from '../../../PsdToPhaserPlugin';
import { createDebugShape } from '../../utils/debugVisualizer';

export default function pointsModule(plugin: PsdToPhaserPlugin) {
    return {
        place(scene: Phaser.Scene, psdKey: string, pointPath: string, options: any = {}): Phaser.GameObjects.GameObject | null {
            const psdData = plugin.getData(psdKey);
            if (!psdData) {
                console.error(`PSD data for key '${psdKey}' not found.`);
                return null;
            }

            const point = this.getPointByPath(psdData.points, pointPath);
            if (!point) {
                console.error(`Point '${pointPath}' not found in PSD data.`);
                return null;
            }

            return this.placePoint(scene, point, options);
        },

        placeAll(scene: Phaser.Scene, psdKey: string, options: any = {}): Phaser.GameObjects.GameObject[] {
            const psdData = plugin.getData(psdKey);
            if (!psdData) {
                console.error(`PSD data for key '${psdKey}' not found.`);
                return [];
            }

            return this.placePointsRecursively(scene, psdData.points, options);
        },

        get(scene: Phaser.Scene, psdKey: string, pointPath?: string, options: any = {}): any {
            const psdData = plugin.getData(psdKey);
            if (!psdData) {
                console.error(`PSD data for key '${psdKey}' not found.`);
                return null;
            }

            if (!pointPath) {
                return this.getAllPoints(psdData.points);
            }

            const point = this.getPointByPath(psdData.points, pointPath);
            if (!point) {
                console.error(`Point '${pointPath}' not found in PSD data.`);
                return null;
            }

            if (options.debug) {
                console.log(`Point '${pointPath}' coordinates: (${point.x}, ${point.y})`);
            }

            if (point.children) {
                return {
                    x: point.x,
                    y: point.y,
                    ...this.getCustomAttributes(point),
                    points: options.recursive ? this.getPointsRecursively(point) : point.children
                };
            } else {
                return point;
            }
        },

        placePoint(scene: Phaser.Scene, point: any, options: any = {}): Phaser.GameObjects.GameObject | null {
            // Don't visualize if it's a layer group (has children)
            if (point.children) {
                return null;
            }

            let gameObject;

            if (options.debug || plugin.options.debug) {
                gameObject = createDebugShape(scene, 'point', point.x, point.y, {
                    name: point.name,
                    color: 0xff0000,
                    radius: 5
                });
            } else {
                gameObject = scene.add.image(point.x, point.y, 'point-texture');
            }

            gameObject.setName(point.name);

            return gameObject;
        },

        placePointsRecursively(scene: Phaser.Scene, points: any[], options: any = {}): Phaser.GameObjects.GameObject[] {
            let placedPoints: Phaser.GameObjects.GameObject[] = [];

            points.forEach(point => {
                const placedPoint = this.placePoint(scene, point, options);
                if (placedPoint) {
                    placedPoints.push(placedPoint);
                }

                if (point.children) {
                    placedPoints = placedPoints.concat(this.placePointsRecursively(scene, point.children, options));
                }
            });

            return placedPoints;
        },

        getPointByPath(points: any[], path: string): any | null {
            const pathParts = path.split('/');
            let current = points.find(p => p.name === pathParts[0]);

            for (let i = 1; i < pathParts.length; i++) {
                if (!current || !current.children) return null;
                current = current.children.find((c: any) => c.name === pathParts[i]);
            }

            return current;
        },

        getPointsRecursively(point: any): any[] {
            let points = point.children ? [] : [point];
            if (point.children) {
                point.children.forEach((child: any) => {
                    points = points.concat(this.getPointsRecursively(child));
                });
            }
            return points;
        },

        getAllPoints(points: any[]): any[] {
            return this.getPointsRecursively({ children: points });
        },

        getCustomAttributes(point: any): any {
            const customAttributes: any = {};
            for (const key in point) {
                if (!['x', 'y', 'name', 'children'].includes(key)) {
                    customAttributes[key] = point[key];
                }
            }
            return customAttributes;
        }
    };
}