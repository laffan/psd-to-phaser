import { DebugOptions } from '../../PsdToPhaserPlugin';
import { getDebugOptions } from './sharedUtils';

export function createDebugShape(scene: Phaser.Scene, type: string, x: number, y: number, options: any = {}): Phaser.GameObjects.GameObject | null {
    const debugOptions = getDebugOptions(options.debugOptions, options.globalDebug);
    let debugShape: Phaser.GameObjects.GameObject | null = null;

    if (debugOptions.shape) {
        switch (type) {
            case 'point':
                debugShape = scene.add.circle(x, y, options.radius || 5, options.color || 0xff0000);
                break;
            case 'sprite':
                debugShape = createSpriteOutline(scene, x, y, options.width, options.height, options.color || 0x00ff00);
                break;
            case 'zone':
                debugShape = createZoneDebugShape(scene, options.shape, options.color || 0x0000ff);
                break;
            default:
                debugShape = scene.add.circle(x, y, 5, 0xffffff);
        }
    }

    if (debugOptions.label && options.name) {
        const debugText = scene.add.text(x, y, options.name, { fontSize: '16px', color: '#ffffff' });
        debugText.setOrigin(0.5, -0.5);
    }

    if (debugOptions.console) {
        console.log(`Debug ${type}:`, options);
    }

    return debugShape;
}

function createSpriteOutline(scene: Phaser.Scene, x: number, y: number, width: number, height: number, color: number): Phaser.GameObjects.Graphics {
    const graphics = scene.add.graphics();
    graphics.lineStyle(2, color, 1);
    graphics.strokeRect(x - width / 2, y - height / 2, width, height);
    return graphics;
}

function createZoneDebugShape(scene: Phaser.Scene, shape: Phaser.Geom.Polygon | Phaser.Geom.Rectangle, color: number): Phaser.GameObjects.Graphics {
    const graphics = scene.add.graphics();
    graphics.lineStyle(2, color, 1);

    if (shape instanceof Phaser.Geom.Polygon) {
        graphics.strokePoints(shape.points, true);
    } else if (shape instanceof Phaser.Geom.Rectangle) {
        graphics.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }

    return graphics;
}

export function getShapeCenter(shape: Phaser.Geom.Polygon | Phaser.Geom.Rectangle): { x: number, y: number } {
    if (shape instanceof Phaser.Geom.Polygon) {
        const bounds = Phaser.Geom.Polygon.GetAABB(shape);
        return { x: bounds.centerX, y: bounds.centerY };
    } else {
        return { x: shape.centerX, y: shape.centerY };
    }
}