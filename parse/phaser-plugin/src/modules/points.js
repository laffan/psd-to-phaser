// // src/modules/pointManager.js

// export function createPoints(scene, points) {
//     points.forEach(point => {
//         const graphics = scene.add.graphics();
//         graphics.fillStyle(0x00ff00);
//         graphics.fillCircle(point.x, point.y, 5);
        
//         if (point.caption) {
//             scene.add.text(point.x, point.y + 10, point.caption, { fontSize: '16px', fill: '#fff' });
//         }

//         if (!point.private) {
//             const hitArea = new Phaser.Geom.Circle(point.x, point.y, 20);
//             const interactiveZone = scene.add.zone(point.x, point.y, 40, 40)
//                 .setInteractive(hitArea, Phaser.Geom.Circle.Contains);
            
//             interactiveZone.on('pointerdown', () => {
//                 console.log(`Clicked on point: ${point.name}`);
//                 // Implement point-specific actions here
//             });
//         }
//     });
// }

