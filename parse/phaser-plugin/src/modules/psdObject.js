// modules/psdObject.js

export class PSDObject {
  static standardProps = [
    "name",
    "x",
    "y",
    "width",
    "height",
    "children",
    "lazyLoad",
  ];

  constructor(data, parent = null) {
    this.parent = parent;
    this.children = [];
    this.lazyLoad = false;
    this.isLoaded = false;

    Object.keys(data).forEach((key) => {
      if (key === "children") {
        this.children = data[key].map(
          (childData) => new PSDObject(childData, this)
        );
      } else {
        this[key] = data[key];
      }
    });

    // Ensure bbox is always defined
    if (!this.bbox) {
      this.bbox = {
        left: this.x,
        top: this.y,
        right: this.x + this.width,
        bottom: this.y + this.height,
      };
    }
  }

  isStandardProp(prop) {
    return PSDObject.standardProps.includes(prop);
  }

  getCustomAttributes() {
    return Object.keys(this)
      .filter((key) => !this.isStandardProp(key) && key !== "parent")
      .reduce((obj, key) => {
        obj[key] = this[key];
        return obj;
      }, {});
  }

  createDebugBox(scene, type, plugin, options = {}) {
    if (!this.shouldDebug(plugin, options)) return null;

    let debugGraphics;
    let debugColor = 0xff00ff ;

    if (type === "zone") {
      const { left, top, right, bottom } = this.bbox;
      const width = right - left;
      const height = bottom - top;
      debugGraphics = scene.add.rectangle(
        left,
        top,
        width,
        height,
        debugColor,
        0.5
      );
      debugGraphics.setOrigin(0, 0); // Set origin to top-left corner
    } else if (type === "sprite" || type === "image") {
      debugGraphics = scene.add.rectangle(
        this.x,
        this.y,
        this.width,
        this.height,
        debugColor,
        0.5
      );
      debugGraphics.setOrigin(0, 0); // Set origin to top-left corner
    } else if (type === "point") {
      debugGraphics = scene.add.circle(this.x, this.y, 5, debugColor, 0.5);
    }

    return debugGraphics;
  }

  getTargetObject(scene, type) {
    switch (type) {
      case "sprite":
        return scene.children.getByName(this.name);
      case "zone":
        return scene.children.getByName(this.name);
      case "point":
        return scene.children.getByName(this.name);
      default:
        return null;
    }
  }

  shouldDebug(plugin, options) {
    return plugin.options.debug || options.debug;
  }

  getPath() {
    return this.parent ? `${this.parent.getPath()}/${this.name}` : this.name;
  }

  findByPath(path) {
    const parts = path.split("/");
    if (parts[0] === this.name) {
      if (parts.length === 1) return this;
      const childName = parts[1];
      const child = this.children.find((c) => c.name === childName);
      return child ? child.findByPath(parts.slice(1).join("/")) : null;
    }
    return null;
  }

  static place(scene, psdData, type, path, placeFunction, options = {}) {
    if (!psdData || !psdData[type]) {
      console.warn(`${type} data not found.`);
      return null;
    }

    let objectToPlace;

    if (type === "tiles") {
      // For tiles, we directly use the layer name as the path
      objectToPlace = psdData[type].layers.find((layer) => layer.name === path);
    } else {
      const parts = path.split("/");
      objectToPlace = psdData[type].find((obj) => obj.name === parts[0]);

      for (let i = 1; i < parts.length; i++) {
        if (!objectToPlace || !objectToPlace.children) return null;
        objectToPlace = objectToPlace.children.find(
          (child) => child.name === parts[i]
        );
      }
    }

    if (!objectToPlace) {
      console.warn(`${type} '${path}' not found in PSD data.`);
      return null;
    }

    const result = placeFunction(scene, objectToPlace, options);

    // Store the placed object for later retrieval
    if (result) {
      if (!psdData[`placed${type.charAt(0).toUpperCase() + type.slice(1)}`]) {
        psdData[`placed${type.charAt(0).toUpperCase() + type.slice(1)}`] = {};
      }
      psdData[`placed${type.charAt(0).toUpperCase() + type.slice(1)}`][path] =
        result;

      // If it's a nested object, store all its children as well
      if (result.children) {
        this.storeNestedObjects(psdData, type, path, result.children);
      }
    }

    return result;
  }
  static storeNestedObjects(psdData, type, parentPath, children) {
    children.forEach((child) => {
      const childPath = `${parentPath}/${child.layerData.name}`;
      psdData[`placed${type.charAt(0).toUpperCase() + type.slice(1)}`][
        childPath
      ] = child;
      if (child.children) {
        this.storeNestedObjects(psdData, type, childPath, child.children);
      }
    });
  }

  static placeAll(scene, psdData, type, placeFunction, options = {}) {
    if (!psdData || !psdData[type]) {
      console.warn(`${type} data not found.`);
      return null;
    }

    const placedObjects = psdData[type].map((rootObject) =>
      placeFunction(scene, rootObject, options)
    );

    // Store the placed objects in the psdData for easy access later
    psdData[`placed${type.charAt(0).toUpperCase() + type.slice(1)}`] =
      placedObjects;

    return placedObjects;
  }

  static get(psdData, type, path) {
    const placedKey = `placed${type.charAt(0).toUpperCase() + type.slice(1)}`;
    if (!psdData || !psdData[placedKey]) {
      console.warn(`Placed ${type} data not found.`);
      return null;
    }

    const parts = path.split("/");
    let current = psdData[placedKey].find(
      (obj) => obj.layerData.name === parts[0]
    );

    for (let i = 1; i < parts.length; i++) {
      if (!current || !current.children) return null;
      current = current.children.find(
        (child) => child.layerData.name === parts[i]
      );
    }

    return current;
  }

  static countRecursive(objects) {
    return objects.reduce((count, obj) => {
      let total = 1; // Count the current object
      if (obj.children && obj.children.length > 0) {
        total += this.countRecursive(obj.children);
      }
      return count + total;
    }, 0);
  }
}

export function createPSDObject(data) {
  return new PSDObject(data);
}
