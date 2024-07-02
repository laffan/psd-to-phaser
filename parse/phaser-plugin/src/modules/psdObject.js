// modules/psdObject.js

export class PSDObject {
    static standardProps = ['name', 'x', 'y', 'width', 'height', 'children', 'lazyLoad'];

    constructor(data, parent = null) {
        this.parent = parent;
        this.children = [];
        this.lazyLoad = false;
        this.isLoaded = false;

        Object.keys(data).forEach(key => {
            if (key === 'children') {
                this.children = data[key].map(childData => new PSDObject(childData, this));
            } else {
                this[key] = data[key];
            }
        });
    }

    isStandardProp(prop) {
        return PSDObject.standardProps.includes(prop);
    }

    getCustomAttributes() {
        return Object.keys(this)
            .filter(key => !this.isStandardProp(key) && key !== 'parent')
            .reduce((obj, key) => {
                obj[key] = this[key];
                return obj;
            }, {});
    }

   addDebugVisualization(scene, type, plugin, options = {}) {
        if (!this.shouldDebug(plugin, options)) return null;

        let debugColor = "0xFF00FF";
        let debugGraphics;
        switch (type) {
            case 'sprite':
                debugGraphics = scene.add.rectangle(this.x, this.y, this.width, this.height, debugColor, 0.5);
                debugGraphics.setOrigin(0, 0);
                break;
            case 'zone':
                const { left, top, right, bottom } = this.bbox;
                const width = right - left;
                const height = bottom - top;
                debugGraphics = scene.add.rectangle(left, top, width, height, debugColor, 0.5);
                debugGraphics.setOrigin(0, 0);
                break;
            case 'point':
                debugGraphics = scene.add.circle(this.x, this.y, 10, debugColor, 0.5);
                break;
            default:
                console.warn(`Unknown debug visualization type: ${type}`);
        }
        return debugGraphics;
    }

    shouldDebug(plugin, options) {
        return plugin.options.debug || options.debug;
    }

    getPath() {
        return this.parent ? `${this.parent.getPath()}/${this.name}` : this.name;
    }

    findByPath(path) {
        const parts = path.split('/');
        if (parts[0] === this.name) {
            if (parts.length === 1) return this;
            const childName = parts[1];
            const child = this.children.find(c => c.name === childName);
            return child ? child.findByPath(parts.slice(1).join('/')) : null;
        }
        return null;
    }
}

export function createPSDObject(data) {
    return new PSDObject(data);
}