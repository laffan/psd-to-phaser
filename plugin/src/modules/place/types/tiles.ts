import PsdToPhaserPlugin from "../../../PsdToPhaserPlugin";
import {
  checkIfLazyLoaded,
  createLazyLoadPlaceholder,
} from "../../shared/lazyLoadUtils";

import { attachAttributes } from "../../shared/attachAttributes";

export function placeTiles(
  scene: Phaser.Scene,
  layer: any,
  plugin: PsdToPhaserPlugin,
  tileSliceSize: number,
  group: Phaser.GameObjects.Group,
  resolve: () => void,
  psdKey: string
): void {
  const tileContainer = scene.add.container(layer.x, layer.y);
  tileContainer.setName(layer.name);

  // Store the original tile data for lazy loading
  tileContainer.setData("tileData", layer);
  tileContainer.setData("tileSliceSize", tileSliceSize);
  tileContainer.setData("psdKey", psdKey);
  tileContainer.setDepth(layer.initialDepth)
    attachAttributes( layer, tileContainer)
  

  const methodsToOverride = [
    "setX",
    "setY",
    "setPosition",
    "setBlendMode",
    "setAlpha",
    "setDepth",
    "setMask",
  ];

  methodsToOverride.forEach((method) => {
    overrideContainerMethod(tileContainer, method);
  });

  const isLazyLoaded = checkIfLazyLoaded(plugin, psdKey, layer);

  if (isLazyLoaded) {
    const placeholder = createLazyLoadPlaceholder(scene, layer, plugin);
    if (placeholder) tileContainer.add(placeholder);
  } else {
    // Check if this PSD was loaded via loadMultiple for tile key namespacing
    const pluginData = plugin.getData(psdKey);
    const useNamespacedKeys = pluginData?.isMultiplePsd || false;
    placeTilesInContainer(scene, tileContainer, layer, tileSliceSize, useNamespacedKeys, psdKey);
  }

  group.add(tileContainer);

  // Create a separate debug group
  const debugGroup = scene.add.group();
  addDebugVisualization(scene, layer, tileSliceSize, debugGroup, plugin);
  // Add the debug group as a child of the main group, but don't include it in the group's children array
  (group as any).debugGroup = debugGroup;

  resolve();
}

export function placeTilesInContainer(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  layer: any,
  tileSliceSize: number,
  useNamespacedKeys: boolean = false,
  psdKey?: string
): void {
  for (let col = 0; col < layer.columns; col++) {
    for (let row = 0; row < layer.rows; row++) {
      const x = col * tileSliceSize;
      const y = row * tileSliceSize;
      const tilesetName = useNamespacedKeys && psdKey ? `${psdKey}_${layer.name}` : layer.name;
      const key = `${tilesetName}_tile_${col}_${row}`;

      const tile = placeSingleTile(
        scene,
        {
          x,
          y,
          key,
          initialDepth: layer.initialDepth,
          tilesetName,
          col,
          row,
        },
        container
      );

      if (tile) {
        container.add(tile);
      }
    }
  }
}

function overrideContainerMethod(
  container: Phaser.GameObjects.Container,
  method: string
): void {
  const originalMethod = (Phaser.GameObjects.Container.prototype as any)[
    method
  ];
  (container as any)[method] = function (...args: any[]) {
    const result = originalMethod.apply(this, args);

    // Special handling for position-related methods
    if (["setX", "setY", "setPosition"].includes(method)) {
      const deltaX =
        method === "setX" || method === "setPosition" ? args[0] - this.x : 0;
      const deltaY =
        method === "setY"
          ? args[0] - this.y
          : method === "setPosition"
          ? args[1] - this.y
          : 0;

      this.each(
        (child: Phaser.GameObjects.GameObject & { x: number; y: number }) => {
          if (deltaX !== 0) child.x += deltaX;
          if (deltaY !== 0) child.y += deltaY;
        }
      );
    } else {
      // For non-position methods, simply apply the method to all children
      this.each((child: Phaser.GameObjects.GameObject) => {
        if (typeof (child as any)[method] === "function") {
          (child as any)[method](...args);
        }
      });
    }

    // Store the method call for lazy loading
    const methodCalls = this.getData("pendingMethodCalls") || [];
    methodCalls.push({ method, args });
    this.setData("pendingMethodCalls", methodCalls);

    return result;
  };
}

export function placeSingleTile(
  scene: Phaser.Scene,
  tileData: {
    x: number;
    y: number;
    key: string;
    initialDepth: number;
    tilesetName: string;
    col: number;
    row: number;
  },
  parent: Phaser.GameObjects.Container | Phaser.GameObjects.Group
): Phaser.GameObjects.Image | null {
  if (scene.textures.exists(tileData.key)) {
    const tile = scene.add.image(tileData.x, tileData.y, tileData.key);
    tile.setOrigin(0, 0);
    if (parent instanceof Phaser.GameObjects.Group) {
      parent.add(tile);
    }
    // console.log(
    //   `Placed tile: ${tileData.key} at (${tileData.x}, ${tileData.y})`
    // );
    return tile;
  } else {
    console.warn(`Texture not found for tile: ${tileData.key}`);
    return null;
  }
}

function addDebugVisualization(
  scene: Phaser.Scene,
  tileData: any,
  tileSliceSize: number,
  group: Phaser.GameObjects.Group,
  plugin: PsdToPhaserPlugin
): void {
  const debugDepth = 1000;

  if (plugin.isDebugEnabled("shape")) {
    const graphics = scene.add.graphics();
    graphics.setDepth(debugDepth);
    graphics.lineStyle(2, 0xff0000, 1);
    graphics.strokeRect(
      tileData.x,
      tileData.y,
      tileData.columns * tileSliceSize,
      tileData.rows * tileSliceSize
    );
    (graphics as any).isDebugObject = true;
    group.add(graphics);
  }

  if (plugin.isDebugEnabled("label")) {
    const text = scene.add.text(tileData.x, tileData.y - 20, tileData.name, {
      fontSize: "16px",
      color: "#ff0000",
      backgroundColor: "#ffffff",
    });
    text.setDepth(debugDepth);
    (text as any).isDebugObject = true;
    group.add(text);
  }
}

interface PendingMethodCall {
  method: string;
  args: any[];
}
export function applyPendingMethodCalls(container: Phaser.GameObjects.Container): void {
  const pendingMethodCalls = container.getData("pendingMethodCalls") || [];
  pendingMethodCalls.forEach(({ method, args }: PendingMethodCall) => {
    if (typeof (container as any)[method] === "function") {
      (container as any)[method](...args);
    }
  });
  container.setData("pendingMethodCalls", []);
}