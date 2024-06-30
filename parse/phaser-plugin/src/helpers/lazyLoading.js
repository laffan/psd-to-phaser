// // src/modules/lazyLoading.js

// import { isObjectInView, createKey } from './utils';
// import { applyCSS, parseCSSString } from './cssParser';

// let layerRegistry = new Map();

// export function setupLazyLoading(scene, key, psdData) {
//     addLazyLayers(scene, ['sprites'], key);
// }

// export function addLazyLayers(scene, layers, key) {
//     const layerProp = `LAZY_${key}_Layers`;
//     layerRegistry.set(layerProp, layers);

//     layers.forEach(layer => {
//         const layerData = scene.cache.json.get(key).psds[0].sprites;
//         layerData.forEach(object => {
//             object.image = `game1/sprites/${object.name}.png`;
//         });
//     });
// }

// export function checkLayerVisibility(scene, key) {
//     const layerProp = `LAZY_${key}_Layers`;
//     const layers = layerRegistry.get(layerProp);
    
//     if (layers) {
//         const data = scene.cache.json.get(key);
//         const worldView = scene.cameras.main.worldView;

//         layers.forEach(layer => {
//             const layerData = data.psds[0].sprites;
//             layerData.forEach(object => {
//                 if (object.visible !== false) {
//                     if (isObjectInView(object, worldView)) {
//                         loadObject(scene, object);
//                     } else {
//                         unloadObject(scene, object);
//                     }
//                 }
//             });
//         });
//     }
// }

// function loadObject(scene, object) {
//     if (!object.loaded) {
//         const key = createKey(object.image, object);
//         if (!scene.textures.exists(key)) {
//             scene.load.image(key, object.image);
//             scene.load.once('complete', () => {
//                 object.loaded = true;
//                 addObjectToScene(scene, object, key);
//             });
//             scene.load.start();
//         } else {
//             addObjectToScene(scene, object, key);
//         }
//     }
// }

// function addObjectToScene(scene, object, key) {
//     const img = scene.add.image(object.x, object.y, key).setOrigin(0, 1);
//     if (object.marbled) {
//         img.setTint(0xff0000);
//     }
//     if (object.css) {
//         applyCSS(img, parseCSSString(object.css));
//     }
//     object.sceneObject = img;
// }

// function unloadObject(scene, object) {
//     if (object.sceneObject) {
//         object.sceneObject.destroy();
//         delete object.sceneObject;
//         object.loaded = false;
//     }
// }