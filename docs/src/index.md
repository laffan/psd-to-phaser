---
layout: base.njk
title: Introduction
---

# PSD to Phaser

psd-to-phaser is a Phaser plugin that reads the JSON manifest created by [psd-to-json](https://pypi.org/project/psd-to-json/), loads the files and then does the work of rebuilding the PSD.

It also has some nifty extras like [lazyLoading](/cameras/lazyload/) and a few presets that I thought might be useful ([parallax](/presets/parallax/) and [build-your-own-joystick](/presets/joystick/) being my favorites.)

## Try It Out

Here's a simple example of loading and placing a PSD:

{% interactive "demos/output/placement", "placement_demo", "// Load the placement demo PSD
this.P2P.load.load(this, 'placement_psd', 'public/demos/output/placement');

// Wait for loading to complete
this.events.once('psdLoadComplete', () => {
  // Place the entire PSD
  const placedPSD = this.P2P.place(this, 'placement_psd', 'dots');
});" %}

## Getting Started

To get started with PSD to Phaser, you'll need:

1. A PSD file processed with [psd-to-json](https://pypi.org/project/psd-to-json/)
2. The Phaser game engine
3. The psd-to-phaser plugin

Check out the [Installation](/installation/) guide to get up and running quickly.

## Key Features

- **Easy PSD Loading**: Load entire PSDs with a single function call
- **Automatic Asset Management**: Sprites, tiles, and animations are handled automatically  
- **Layer Placement**: Place individual layers or entire groups with precise positioning
- **LazyLoad Support**: Load assets only when they come into view
- **Camera Controls**: Built-in draggable and lazy-loading camera features
- **Preset Functions**: Common game patterns like buttons, parallax, and joysticks
- **Debug Tools**: Visual debugging for placement and boundaries

## Examples

The [Examples](/examples/) section contains practical demonstrations of key features, with interactive code samples you can modify and run right in your browser.