import PsdToPhaserPlugin from "../../../PsdToPhaserPlugin";

interface JoystickOptions {
  bounceBack?: boolean;
  springStrength?: number;
  joystickRadius?: number;
}

interface ControlOptions {
  type: "speed" | "velocity" | "unit" | "tracked";
  force?: number;
  maxSpeed?: number;
  pixels?: number;
  directionLock?: 4 | 8 | false;
  repeatRate?: number;
  multiplier?: number;
}

interface TargetedObject extends Phaser.GameObjects.Sprite {
  width: number;
  height: number;
}

export function joystick(_plugin: PsdToPhaserPlugin) {
  return function (
    joystickObject: TargetedObject,
    zoneObject: Phaser.GameObjects.Zone,
    key: string,
    options: JoystickOptions = {}
  ) {
    const scene = zoneObject.scene;
    const bounceBack = options.bounceBack || false;
    const joystickRadius = options.joystickRadius || 50;

    joystickObject.setOrigin(0.5, 0.5);
    joystickObject.setPosition(
      joystickObject.x + joystickObject.width / 2,
      joystickObject.y + joystickObject.height / 2
    );

    const startPosition = { x: joystickObject.x, y: joystickObject.y };
    const zoneShape = zoneObject.getData("points") as Phaser.Geom.Point[];
    const zoneBounds = zoneShape
      ? new Phaser.Geom.Polygon(zoneShape)
      : zoneObject.getBounds();

    let activePointer: Phaser.Input.Pointer | null = null;

    const clampToZone = (x: number, y: number) => {
      const center = getPolygonCenter(zoneBounds as Phaser.Geom.Polygon);
      const vector = new Phaser.Math.Vector2(x - center.x, y - center.y);
      const length = vector.length();

      if (length > joystickRadius) {
        vector.setLength(joystickRadius);
      }

      const clampedPoint = {
        x: center.x + vector.x,
        y: center.y + vector.y,
      };

      if (zoneShape) {
        if (
          Phaser.Geom.Polygon.Contains(
            zoneBounds as Phaser.Geom.Polygon,
            clampedPoint.x,
            clampedPoint.y
          )
        ) {
          return clampedPoint;
        }
        return getClosestPointOnPolygon(
          zoneBounds as Phaser.Geom.Polygon,
          clampedPoint.x,
          clampedPoint.y
        );
      } else {
        return {
          x: Phaser.Math.Clamp(
            clampedPoint.x,
            (zoneBounds as Phaser.Geom.Rectangle).left,
            (zoneBounds as Phaser.Geom.Rectangle).right
          ),
          y: Phaser.Math.Clamp(
            clampedPoint.y,
            (zoneBounds as Phaser.Geom.Rectangle).top,
            (zoneBounds as Phaser.Geom.Rectangle).bottom
          ),
        };
      }
    };

    const getNormalizedPosition = (x: number, y: number) => {
      const center = getPolygonCenter(zoneBounds as Phaser.Geom.Polygon);
      return {
        x: (x - center.x) / joystickRadius,
        y: (y - center.y) / joystickRadius,
      };
    };

    const isPointerInBounds = (
      pointer: Phaser.Input.Pointer,
      bounds: Phaser.Geom.Rectangle
    ) => {
      return (
        pointer.x >= bounds.left &&
        pointer.x <= bounds.right &&
        pointer.y >= bounds.top &&
        pointer.y <= bounds.bottom
      );
    };

    const onPointerDown = (pointer: Phaser.Input.Pointer) => {
      if (
        activePointer === null &&
        isPointerInBounds(pointer, joystickObject.getBounds())
      ) {
        activePointer = pointer;
        scene.events.emit("joystickStart", {
          [key]: {
            isActive: true,
            position: { x: joystickObject.x, y: joystickObject.y },
            change: { x: 0, y: 0 },
            normalized: { x: 0, y: 0 },
          },
        });
      }
    };

    const onPointerMove = (pointer: Phaser.Input.Pointer) => {
      if (pointer === activePointer) {
        const { x: newX, y: newY } = clampToZone(pointer.x, pointer.y);
        joystickObject.setPosition(newX, newY);

        const change = {
          x: newX - startPosition.x,
          y: newY - startPosition.y,
        };

        const normalized = getNormalizedPosition(newX, newY);

        scene.events.emit("joystickActive", {
          [key]: {
            isActive: true,
            position: { x: newX, y: newY },
            change,
            normalized,
          },
        });
      }
    };

    const onPointerUp = (pointer: Phaser.Input.Pointer) => {
      if (pointer === activePointer) {
        activePointer = null;
        if (bounceBack) {
          scene.tweens.add({
            targets: joystickObject,
            x: startPosition.x,
            y: startPosition.y,
            duration: 300,
            ease: "Bounce.out",
            onComplete: () => {
              scene.events.emit("joystickRelease", {
                [key]: {
                  isActive: false,
                  position: startPosition,
                  change: { x: 0, y: 0 },
                  normalized: { x: 0, y: 0 },
                },
              });
            },
          });
        } else {
          scene.events.emit("joystickRelease", {
            [key]: {
              isActive: false,
              position: { x: joystickObject.x, y: joystickObject.y },
              change: {
                x: joystickObject.x - startPosition.x,
                y: joystickObject.y - startPosition.y,
              },
              normalized: getNormalizedPosition(
                joystickObject.x,
                joystickObject.y
              ),
            },
          });
        }
      }
    };

    scene.input.on("pointerdown", onPointerDown);
    scene.input.on("pointermove", onPointerMove);
    scene.input.on("pointerup", onPointerUp);
    scene.input.on("pointerupoutside", onPointerUp);

    function destroyJoystick() {
      scene.input.off("pointerdown", onPointerDown);
      scene.input.off("pointermove", onPointerMove);
      scene.input.off("pointerup", onPointerUp);
      scene.input.off("pointerupoutside", onPointerUp);
    }

    return {
      control: (
        spriteToControl: Phaser.GameObjects.Sprite,
        controlOptions: ControlOptions
      ) => {
        let velocity = new Phaser.Math.Vector2();
        let lastMoveTime = 0;
        const spriteStartPosition = new Phaser.Math.Vector2(
          spriteToControl.x,
          spriteToControl.y
        );
        const joystickCenter = new Phaser.Math.Vector2(
          startPosition.x,
          startPosition.y
        );

        const applyDirectionLock = (x: number, y: number): [number, number] => {
          if (!controlOptions.directionLock) return [x, y];

          if (controlOptions.directionLock === 4) {
            return Math.abs(x) > Math.abs(y) ? [x, 0] : [0, y];
          }

          if (controlOptions.directionLock === 8) {
            const angle = Math.atan2(y, x);
            const octant = Math.round((8 * angle) / (2 * Math.PI) + 8) % 8;
            const octantAngle = (octant * Math.PI) / 4;
            return [Math.cos(octantAngle), Math.sin(octantAngle)];
          }

          return [x, y];
        };

        const moveSprite = (x: number, y: number, delta: number) => {
          [x, y] = applyDirectionLock(x, y);

          switch (controlOptions.type) {
            case "speed":
              const speed = controlOptions.maxSpeed || 300;
              spriteToControl.x += (x * speed * delta) / 1000;
              spriteToControl.y += (y * speed * delta) / 1000;
              break;
            case "velocity":
              const body = spriteToControl.body as Phaser.Physics.Arcade.Body;
              if (body) {
                const force = controlOptions.force || 1;
                body.setVelocity(x * force * 60, y * force * 60);
              }
              break;
            case "unit":
              const currentTime = scene.time.now;
              const repeatRate = controlOptions.repeatRate || 0;
              const pixels = controlOptions.pixels || 100;
              const threshold = 0.2;

              if (Math.abs(x) > threshold || Math.abs(y) > threshold) {
                if (lastMoveTime === 0 || currentTime - lastMoveTime >= repeatRate) {
                  const angle = Math.atan2(y, x);
                  spriteToControl.x += Math.round(Math.cos(angle) * pixels);
                  spriteToControl.y += Math.round(Math.sin(angle) * pixels);
                  lastMoveTime = currentTime;
                }
              }
              break;
            case "tracked":
              const multiplier = controlOptions.multiplier || 1;
              const offsetX = (x - joystickCenter.x) * multiplier;
              const offsetY = (y - joystickCenter.y) * multiplier;
              spriteToControl.setPosition(
                spriteStartPosition.x + offsetX,
                spriteStartPosition.y + offsetY
              );
              break;
          }
        };

        const onJoystickActive = (values: any) => {
          if (values[key]) {
            if (controlOptions.type === "tracked") {
              const position = values[key].position;
              moveSprite(position.x, position.y, 0);
            } else {
              velocity.set(values[key].normalized.x, values[key].normalized.y);
              // Trigger immediate move on first joystick activation
              if (lastMoveTime === 0) {
                moveSprite(velocity.x, velocity.y, 0);
              }
            }
          }
        };

        const onJoystickRelease = (values: any) => {
          if (values[key]) {
            velocity.reset();
            lastMoveTime = 0; // Reset lastMoveTime on release
            if (controlOptions.type === "velocity") {
              const body = spriteToControl.body as Phaser.Physics.Arcade.Body;
              if (body) {
                body.setVelocity(0, 0);
              }
            } else if (
              controlOptions.type === "tracked" &&
              options.bounceBack
            ) {
              spriteToControl.setPosition(
                spriteStartPosition.x,
                spriteStartPosition.y
              );
            }
          }
        };

        const onUpdate = (_time: number, delta: number) => {
          if (
            controlOptions.type !== "tracked" &&
            (velocity.x !== 0 || velocity.y !== 0)
          ) {
            moveSprite(velocity.x, velocity.y, delta);
          }
        };

        scene.events.on("joystickActive", onJoystickActive);
        scene.events.on("joystickRelease", onJoystickRelease);
        scene.events.on("update", onUpdate);

        return {
          destroy: () => {
            destroyJoystick();
            scene.events.off("joystickActive", onJoystickActive);
            scene.events.off("joystickRelease", onJoystickRelease);
            scene.events.off("update", onUpdate);
          },
        };
      },
      destroy: destroyJoystick,
    };
  };
}

// Utility functions
function getClosestPointOnPolygon(
  polygon: Phaser.Geom.Polygon,
  x: number,
  y: number
): Phaser.Geom.Point {
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

function getClosestPointOnLine(
  start: Phaser.Geom.Point,
  end: Phaser.Geom.Point,
  x: number,
  y: number
): Phaser.Geom.Point {
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
  let sumX = 0,
    sumY = 0;
  for (const point of polygon.points) {
    sumX += point.x;
    sumY += point.y;
  }
  return new Phaser.Geom.Point(
    sumX / polygon.points.length,
    sumY / polygon.points.length
  );
}
