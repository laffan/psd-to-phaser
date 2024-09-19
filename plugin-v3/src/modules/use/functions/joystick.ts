import PsdToPhaserPlugin from '../../../PsdToPhaserPlugin';

interface JoystickOptions {
  bounceBack?: boolean;
  springStrength?: number;
  joystickRadius?: number;
  throttleMS?: number;
}

export function joystick(plugin: PsdToPhaserPlugin) {
  return function(
    joystickPath: string,
    zonePath: string,
    key: string,
    options: JoystickOptions = {}
  ) {
    const scene = plugin.scene;
    const bounceBack = options.bounceBack || false;
    const springStrength = options.springStrength || 0.5;
    const joystickRadius = options.joystickRadius || 50;
    const throttleMS = options.throttleMS || 50;

    const joystickObject = plugin.get(scene, joystickPath);
    const zoneObject = plugin.get(scene, zonePath);

    if (!joystickObject || !zoneObject) {
      console.error(`Joystick or zone not found for paths: ${joystickPath}, ${zonePath}`);
      return;
    }

    const startPosition = { x: joystickObject.x, y: joystickObject.y };
    const zoneShape = zoneObject.getData('points') as Phaser.Geom.Point[];
    const zoneBounds = zoneShape ? new Phaser.Geom.Polygon(zoneShape) : zoneObject.getBounds();

    // Check if the joystick is within the zone
    const inZone = zoneShape 
      ? Phaser.Geom.Polygon.Contains(zoneBounds as Phaser.Geom.Polygon, joystickObject.x, joystickObject.y)
      : Phaser.Geom.Rectangle.Contains(zoneBounds as Phaser.Geom.Rectangle, joystickObject.x, joystickObject.y);
    if (!inZone) {
      console.warn(`Joystick "${key}" does not start within its zone.`);
    }

    // Make the joystick interactive and draggable
    joystickObject.setInteractive();
    scene.input.setDraggable(joystickObject);

    let dragTween: Phaser.Tweens.Tween | null = null;
    let lastUpdateTime = 0;

    const throttle = (func: Function) => {
      return (...args: any[]) => {
        const now = Date.now();
        if (now - lastUpdateTime >= throttleMS) {
          lastUpdateTime = now;
          func(...args);
        }
      };
    };

    const clampToZone = throttle((x: number, y: number) => {
      const center = getPolygonCenter(zoneBounds as Phaser.Geom.Polygon);
      const vector = new Phaser.Math.Vector2(x - center.x, y - center.y);
      const length = vector.length();
      
      if (length > joystickRadius) {
        vector.setLength(joystickRadius);
      }
      
      const clampedPoint = {
        x: center.x + vector.x,
        y: center.y + vector.y
      };

      if (zoneShape) {
        if (Phaser.Geom.Polygon.Contains(zoneBounds as Phaser.Geom.Polygon, clampedPoint.x, clampedPoint.y)) {
          return clampedPoint;
        }
        return getClosestPointOnPolygon(zoneBounds as Phaser.Geom.Polygon, clampedPoint.x, clampedPoint.y);
      } else {
        return {
          x: Phaser.Math.Clamp(clampedPoint.x, (zoneBounds as Phaser.Geom.Rectangle).left, (zoneBounds as Phaser.Geom.Rectangle).right),
          y: Phaser.Math.Clamp(clampedPoint.y, (zoneBounds as Phaser.Geom.Rectangle).top, (zoneBounds as Phaser.Geom.Rectangle).bottom)
        };
      }
    });

    const getNormalizedPosition = throttle((x: number, y: number) => {
      const center = getPolygonCenter(zoneBounds as Phaser.Geom.Polygon);
      return {
        x: (x - center.x) / joystickRadius,
        y: (y - center.y) / joystickRadius
      };
    });

    // Set up drag events
    scene.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (gameObject === joystickObject) {
        if (dragTween) dragTween.stop();
        scene.events.emit('joystickStart', { [key]: { isActive: true, position: { x: joystickObject.x, y: joystickObject.y }, change: { x: 0, y: 0 }, normalized: { x: 0, y: 0 } } });
      }
    });

    scene.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
      if (gameObject === joystickObject) {
        const { x: newX, y: newY } = clampToZone(dragX, dragY);
        joystickObject.setPosition(newX, newY);

        const change = {
          x: newX - startPosition.x,
          y: newY - startPosition.y
        };

        const normalized = getNormalizedPosition(newX, newY);

        scene.events.emit('joystickActive', { [key]: { isActive: true, position: { x: newX, y: newY }, change, normalized } });
      }
    });

    scene.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (gameObject === joystickObject) {
        if (bounceBack) {
          if (dragTween) dragTween.stop();
          dragTween = scene.tweens.add({
            targets: joystickObject,
            x: startPosition.x,
            y: startPosition.y,
            duration: 300,
            ease: 'Bounce.out',
            onComplete: () => {
              scene.events.emit('joystickRelease', { [key]: { isActive: false, position: startPosition, change: { x: 0, y: 0 }, normalized: { x: 0, y: 0 } } });
            }
          });
        } else {
          scene.events.emit('joystickRelease', { [key]: { isActive: false, position: { x: joystickObject.x, y: joystickObject.y }, change: { x: joystickObject.x - startPosition.x, y: joystickObject.y - startPosition.y }, normalized: getNormalizedPosition(joystickObject.x, joystickObject.y) } });
        }
      }
    });

    return {
      destroy: () => {
        scene.input.off('dragstart');
        scene.input.off('drag');
        scene.input.off('dragend');
        joystickObject.disableInteractive();
        if (dragTween) dragTween.stop();
      }
    };
  };
}

// Utility functions (getClosestPointOnPolygon, getClosestPointOnLine, getPolygonCenter) remain the same

// Utility functions (getClosestPointOnPolygon, getClosestPointOnLine, getPolygonCenter) remain the same


function getClosestPointOnPolygon(polygon: Phaser.Geom.Polygon, x: number, y: number): Phaser.Geom.Point {
  let closestPoint = new Phaser.Geom.Point();
  let minDistance = Number.MAX_VALUE;

  for (let i = 0; i < polygon.points.length; i++) {
    const start = polygon.points[i];
    const end = polygon.points[(i + 1) % polygon.points.length];
    const closest = getClosestPointOnLine(start, end, x, y);
    const distance = Phaser.Math.Distance.Between(x, y, closest.x, closest.y);

    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = closest;
    }
  }

  return closestPoint;
}

function getClosestPointOnLine(start: Phaser.Geom.Point, end: Phaser.Geom.Point, x: number, y: number): Phaser.Geom.Point {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const t = ((x - start.x) * dx + (y - start.y) * dy) / (dx * dx + dy * dy);
  const clampedT = Phaser.Math.Clamp(t, 0, 1);
  return new Phaser.Geom.Point(
    start.x + clampedT * dx,
    start.y + clampedT * dy
  );
}

function getPolygonCenter(polygon: Phaser.Geom.Polygon): Phaser.Geom.Point {
  let sumX = 0, sumY = 0;
  for (const point of polygon.points) {
    sumX += point.x;
    sumY += point.y;
  }
  return new Phaser.Geom.Point(sumX / polygon.points.length, sumY / polygon.points.length);
}

function getMaxDistanceFromCenter(polygon: Phaser.Geom.Polygon, center: Phaser.Geom.Point): number {
  return Math.max(...polygon.points.map(p => 
    Phaser.Math.Distance.Between(center.x, center.y, p.x, p.y)
  ));
}