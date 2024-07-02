// modules/psdObject.js

export class PSDObject {
    static standardProps = ['name'];

    constructor(data) {
        this.name = data.name;
        
        Object.keys(data).forEach(key => {
            if (key !== 'name') {
                this[key] = data[key];
            }
        });
    }

    isStandardProp(prop) {
        return PSDObject.standardProps.includes(prop);
    }

    getCustomAttributes() {
        return Object.keys(this)
            .filter(key => !this.isStandardProp(key))
            .reduce((obj, key) => {
                obj[key] = this[key];
                return obj;
            }, {});
    }

    addDebugVisualization(scene, type) {
        let debugGraphics;
        const debugColor = "0xff00de";
        switch (type) {
            case 'sprite':
                debugGraphics = scene.add.graphics();
                debugGraphics.lineStyle(2, debugColor, 1); // Green outline
                debugGraphics.strokeRect(this.x, this.y, this.width, this.height);
                break;
            case 'zone':
                const debugContainer = scene.add.container(this.bbox.left, this.bbox.top);
                if (this.subpaths && this.subpaths.length > 0) {
                    const width = this.bbox.right - this.bbox.left;
                    const height = this.bbox.bottom - this.bbox.top;
                    const rectGraphics = scene.add.rectangle(0, 0, width, height, debugColor, 0.5);
                    rectGraphics.setOrigin(0, 0);
                    debugContainer.add(rectGraphics);
                }
                debugGraphics = debugContainer;
                break;
            case 'point':
                debugGraphics = scene.add.circle(this.x, this.y, 10, debugColor, 0.5);
                break;
            default:
                console.warn(`Unknown debug visualization type: ${type}`);
        }
        return debugGraphics;
    }
}

export function createPSDObject(data) {
    return new PSDObject(data);
}