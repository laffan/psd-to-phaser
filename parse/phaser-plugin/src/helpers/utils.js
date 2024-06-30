// // src/modules/utils.js

// export function createKey(base, object, append = "") {
//     return base.split("/").pop().split(".")[0] +
//         "_" + Math.round(object.x) +
//         "_" + Math.round(object.y) + append;
// }

// export function isObjectInView(object, worldView) {
//     const objectRect = new Phaser.Geom.Rectangle(
//         object.x,
//         object.y - object.height,
//         object.width,
//         object.height
//     );
//     return Phaser.Geom.Intersects.RectangleToRectangle(objectRect, worldView);
// }

// export function createBaseLayers(scene, psdData) {
//     ['base', 'clouds'].forEach(key => {
//         const image = scene.add.image(0, 0, key).setOrigin(0, 0);
//         image.displayWidth = psdData.width;
//         image.displayHeight = psdData.height;
//     });
// }