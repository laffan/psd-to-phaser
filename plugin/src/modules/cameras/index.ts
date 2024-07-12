// src/modules/cameras/index.ts

import PsdToPhaserPlugin from "../../PsdToPhaserPlugin";
import { CameraManager } from "./CameraManager";
import { CameraConfig } from "../typeDefinitions";

export default function camerasModule(plugin: PsdToPhaserPlugin) {
  return {
    createCamera(camera: Phaser.Cameras.Scene2D.Camera, features: string[] = [], psdKey: string, config: CameraConfig = {}) {
      return new CameraManager(plugin, camera, features, psdKey, config);
    }
  };
}