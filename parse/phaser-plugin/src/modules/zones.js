// // src/modules/zoneManager.js

// export function createZones(scene, zones) {
//     zones.forEach(zone => {
//         const zoneShape = createShapeFromZone(zone);
//         if (zoneShape) {
//             const graphics = scene.add.graphics();
//             graphics.lineStyle(2, 0xff0000);
//             if (zone.type === 'vector') {
//                 graphics.strokePoints(zoneShape.points, true);
//             } else {
//                 graphics.strokeRectShape(zoneShape);
//             }

//             const zoneArea = scene.add.zone(0, 0, scene.cameras.main.width, scene.cameras.main.height)
//                 .setOrigin(0)
//                 .setInteractive(zoneShape, Phaser.Geom.Polygon.Contains);
            
//             zoneArea.on('pointerdown', () => {
//                 console.log(`Entered ${zone.name}`);
//                 if (zone.attributes.music) {
//                     console.log(`Playing ${zone.attributes.music}`);
//                     // Implement music playing logic here
//                 }
//             });
//         }
//     });
// }

// function createShapeFromZone(zone) {
//     if (zone.type === 'vector') {
//         const points = zone.subpaths[0].map(([x, y]) => new Phaser.Geom.Point(x, y));
//         return new Phaser.Geom.Polygon(points);
//     } else if (zone.type === 'raster') {
//         return new Phaser.Geom.Rectangle(
//             zone.center_x - zone.width / 2,
//             zone.center_y - zone.height / 2,
//             zone.width,
//             zone.height
//         );
//     }
//     return null;
// }