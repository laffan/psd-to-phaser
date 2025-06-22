---
layout: base.njk
title: Cameras Overview
---

# Cameras

P2P provides enhanced camera functions that help optimize your project and add common interaction patterns. You can add features like lazy loading and drag controls to any camera using the `createCamera()` function.

## Basic Camera Setup

The basic syntax for creating enhanced cameras is:

```javascript
this.P2P.createCamera(camera, features, options?)
```

- **camera**: The Phaser camera to enhance (usually `this.cameras.main`)
- **features**: Array of feature names (`['draggable']`, `['lazyLoad']`, etc.)
- **options**: Optional configuration object for the features

## Available Camera Features

### [LazyLoad Camera](/cameras/lazyload/)
Load assets only when they enter the camera view, optimizing performance for large worlds.

### [Draggable Camera](/cameras/draggable/)
Click and drag to move around the canvas with easing and boundary options.

## Combined Features

You can combine multiple camera features for powerful interactions:

{% interactive "demos/output/cameras", "combined_camera", "// Load scene with lazy loading
this.P2P.load.load(this, 'camera_psd', 'public/demos/output/cameras', {
  lazyLoad: ['background', 'effects']
});

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'camera_psd', 'root');
  
  // Combined draggable + lazyLoad camera
  this.superCamera = this.P2P.createCamera(
    this.cameras.main, 
    ['lazyLoad', 'draggable'], 
    {
      lazyLoad: {
        extendPreloadBounds: 20,
        debug: { console: true }
      },
      draggable: {
        easeDragging: true,
        friction: 0.9
      }
    }
  );
  
  console.log('Drag around and watch lazy loading!');
});" %}

Camera features provide essential functionality for creating responsive, performance-optimized games with large worlds and complex asset loading requirements.