// src/main.js
import Phaser from "phaser";
import isMobile from "./helpers/isMobile";
import PsdToPhaserPlugin from "psd-to-phaser-plugin";
import { LoadScene } from "./scenes/Load";
import { PlayScene } from "./scenes/Play";

const gameParent = "game";

// Remove "loading" string
document.getElementById("loading").style.display = "none";
// Check to see if on a mobile browser
const onMobile = isMobile();
// Add border radius if you are not
document.getElementById(gameParent).style.borderRadius = onMobile
  ? "0"
  : "20px";

const gameConfig = {
  parent: gameParent,
  type: Phaser.AUTO,
  backgroundColor: "#cfcfcf",
  width: onMobile ? window.innerWidth : 600,
  height: onMobile ? window.innerHeight : 600,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
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
            shape: true,
            label: false,
          },
        },
      },
    ],
  },
  scene: [LoadScene, PlayScene],
};

new Phaser.Game(gameConfig);
