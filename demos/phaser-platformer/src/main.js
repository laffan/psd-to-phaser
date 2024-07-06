// src/main.js
import Phaser from "phaser";
import isMobile from "./helpers/isMobile";
import { LoadScene } from "./scenes/Load";
import { PlayScene } from "./scenes/Play";
import { TestScene } from "./scenes/Test";
import PsdToPhaserPlugin from 'psd-to-phaser-plugin';

const gameParentID = "game";

// Remove "loading" string
document.getElementById("loading").style.display = "none";
// Check to see if on a mobile browser
const onMobile = isMobile();
// Add border radius if you are not
document.getElementById(gameParentID).style.borderRadius = onMobile
  ? "0"
  : "20px";

const gameConfig = {
  parent: gameParentID,
  type: Phaser.AUTO,
  backgroundColor: "#cfcfcf",
  width: onMobile ? window.innerWidth : 809,
  height: onMobile ? window.innerHeight : 500,
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
        key: 'PsdToPhaserPlugin',
        plugin: PsdToPhaserPlugin,
        start: true,
        mapping: "P2P",
        data: { debug: false },
      },
    ],
  },
  // scene: [TestScene ],
  scene: [LoadScene, PlayScene],
};

new Phaser.Game(gameConfig);
