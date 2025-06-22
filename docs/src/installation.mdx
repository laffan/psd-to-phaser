---
layout: base.njk
title: Installation
---

# Installation

Get started with psd-to-phaser by installing the plugin and setting up your development environment.

## Requirements

To use psd-to-phaser, you'll need:

1. **PSD files processed with [psd-to-json](https://pypi.org/project/psd-to-json/)**
2. **Phaser 3.x** game engine
3. **Node.js and npm** for package management

## Install psd-to-phaser

```bash
npm install psd-to-phaser
```

## Install psd-to-json

First, install the Python tool that converts PSDs to usable JSON:

```bash
pip install psd-to-json
```

## Convert Your PSD

Use psd-to-json to convert your PSD files:

```bash
# Convert a single PSD
psd-to-json your-file.psd output-folder/

# Convert with options
psd-to-json your-file.psd output-folder/ --scale 0.5 --format png
```

This creates a folder structure with:
- `data.json` - Layer information and structure
- `sprites/` - Individual layer images
- `spritesheets/` - Combined sprite sheets (if applicable)

## Basic Setup

### 1. Import the Plugin

```javascript
import PsdToPhaser from 'psd-to-phaser';
```

### 2. Initialize in Your Game Config

```javascript
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  plugins: {
    global: [
      {
        key: "PsdToPhaser",
        plugin: PsdToPhaser,
        start: true,
        mapping: "P2P", // Access via this.P2P in scenes
        data: {
          debug: {
            shape: false,   // Show sprite boundaries
            label: false,   // Show sprite labels
            console: false  // Console logging
          }
        }
      }
    ]
  },
  scene: YourScene
};

new Phaser.Game(config);
```

### 3. Use in Your Scene

```javascript
class YourScene extends Phaser.Scene {
  preload() {
    // Load PSD data
    this.P2P.load.load(this, 'my_psd', 'assets/psd-output');
  }
  
  create() {
    // Wait for loading to complete
    this.events.once('psdLoadComplete', () => {
      // Place the PSD content
      const psd = this.P2P.place(this, 'my_psd', 'root');
      psd.setPosition(400, 300);
    });
  }
}
```

## Directory Structure

After running psd-to-json, your assets should look like:

```
assets/
  psd-output/
    data.json
    sprites/
      background.png
      character.png
      ui-button.png
```

## CDN Usage

For quick prototyping, you can use the CDN version:

```html
<script src="https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/psd-to-phaser/dist/psd-to-phaser.min.js"></script>

<script>
const config = {
  // ... your config
  plugins: {
    global: [
      {
        key: "PsdToPhaser",
        plugin: window.PsdToPhaserPlugin, // Note: different export name
        start: true,
        mapping: "P2P"
      }
    ]
  }
};
</script>
```

## Troubleshooting

### Common Issues

**"PSD not loading"**
- Check that the path to your PSD output folder is correct
- Ensure `data.json` exists in the specified folder
- Verify that sprite files referenced in `data.json` exist

**"Textures not found"**
- Make sure image files are in the correct relative paths
- Check that file extensions match what's in `data.json`
- Verify your web server can serve the image files

**"Plugin not found"**
- Check that the plugin is properly imported/included
- Verify the plugin key matches your configuration
- For CDN usage, ensure the global variable name is correct

### Debug Mode

Enable debug mode to troubleshoot issues:

```javascript
data: {
  debug: {
    shape: true,   // See sprite boundaries
    label: true,   // See sprite names
    console: true  // Get console output
  }
}
```

## Next Steps

Once installed:

1. [Learn about loading PSDs](/posts/loading/)
2. [Explore placing and positioning layers](/posts/placing/)
3. [Discover sprite types and animations](/posts/sprite-types/)
4. [Try the camera features](/cameras/)
5. [Use preset functions](/presets/)

Ready to start building? Check out the [examples page](/examples/) for complete working demos!