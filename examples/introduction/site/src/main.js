// src/main.js
import Phaser from "phaser";
import PsdToPhaserPlugin from "psd-to-phaser-plugin";
import { LoadScene } from "./scenes/Load";
import { PlayScene } from "./scenes/Play";

// Remove "loading" string
document.getElementById("loading").style.display = "none";

const gameConfig = {
  parent: "game",
  type: Phaser.AUTO,
  backgroundColor: "#cfcfcf",
  width: 803,
  height: 560,
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        x: 0,
        y: 0,
      },
    },
  },
  plugins: {
    global: [
      {
        key: "PsdToPhaserPlugin",
        plugin: PsdToPhaserPlugin,
        start: true,
        mapping: "P2P",
        data: {
          debug: {
            console: true,
            shape: false,
            label: false,
          },
        },
      },
    ],
  },
  scene: [LoadScene, PlayScene],
};

new Phaser.Game(gameConfig);
