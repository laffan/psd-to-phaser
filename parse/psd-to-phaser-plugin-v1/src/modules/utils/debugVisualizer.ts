import { DebugOptions } from '../../PsdToPhaserPlugin';

export function createDebugShape(scene: Phaser.Scene, type: string, x: number, y: number, options: any = {}): Phaser.GameObjects.GameObject | null {
    const debugOptions = getDebugOptions(options.debugOptions);
    let debugShape: Phaser.GameObjects.GameObject | null = null;

    if (debugOptions.shape) {
        switch (type) {
            case 'point':
                debugShape = scene.add.circle(x, y, options.radius || 5, options.color || 0xff0000);
                break;
            case 'sprite':
                debugShape = scene.add.rectangle(x, y, options.width || 10, options.height || 10, options.color || 0x00ff00);
                break;
            case 'zone':
                debugShape = createZoneDebugShape(scene, options.shape, options.color || 0x0000ff);
                break;
            default:
                debugShape = scene.add.circle(x, y, 5, 0xffffff);
        }
    }

    if (debugOptions.label && options.name) {
        const debugText = scene.add.text(x + 10, y + 10, options.name, { fontSize: '16px', color: '#ffffff' });
        debugText.setOrigin(0, 0);
    }

    if (debugOptions.console) {
        console.log(`Debug ${type}:`, options);
    }

    return debugShape;
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

function getDebugOptions(options: boolean | DebugOptions | undefined): DebugOptions {
    if (typeof options === 'boolean') {
        return { console: options, shape: options, label: options };
    } else if (typeof options === 'object') {
        return {
            console: options.console || false,
            shape: options.shape || false,
            label: options.label || false
        };
    }
    return { console: false, shape: false, label: false };
}

