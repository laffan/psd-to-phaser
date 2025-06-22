---
layout: base.njk
title: Cameras
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

## Draggable Camera

The draggable camera lets you click and drag around the canvas with desktop and mobile support:

{% interactive "demos/output/cameras", "draggable_basic", "// Load a large scene
this.P2P.load.load(this, 'camera_psd', 'public/demos/output/cameras');

this.events.once('psdLoadComplete', () => {
  // Place the scene
  const scene = this.P2P.place(this, 'camera_psd', 'root');
  scene.setPosition(0, 0);
  
  // Create draggable camera
  this.dragCam = this.P2P.createCamera(this.cameras.main, ['draggable']);
  
  console.log('Click and drag to move around!');
});" %}

## Draggable with Options

You can customize the draggable behavior with various options:

{% interactive "demos/output/cameras", "draggable_options", "// Load scene
this.P2P.load.load(this, 'camera_psd', 'public/demos/output/cameras');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'camera_psd', 'root');
  scene.setPosition(0, 0);
  
  // Create draggable camera with options
  this.dragCam = this.P2P.createCamera(this.cameras.main, ['draggable'], {
    draggable: {
      useBounds: { x: -200, y: -200, width: 800, height: 600 },
      easeDragging: true,
      friction: 0.95,
      minSpeed: 0.1
    }
  });
  
  console.log('Drag with bounds and easing!');
});" %}

## LazyLoad Camera

The lazyLoad camera works with `lazyLoad` attributes to load assets only when they enter the camera view:

{% interactive "demos/output/cameras", "lazy_load_basic", "// Load with lazy loading enabled
this.P2P.load.load(this, 'camera_psd', 'public/demos/output/cameras', {
  lazyLoad: ['heavyAssets', 'distantObjects']
});

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'camera_psd', 'root');
  scene.setPosition(0, 0);
  
  // Create lazyLoad camera
  this.lazyCamera = this.P2P.createCamera(this.cameras.main, ['lazyLoad'], {
    lazyLoad: {
      extendPreloadBounds: 50,
      debug: {
        console: true
      }
    }
  });
  
  console.log('Move camera to trigger lazy loading!');
});" %}

## LazyLoad with Debug

Debug options help you visualize and understand the lazy loading behavior:

{% interactive "demos/output/cameras", "lazy_load_debug", "// Load with lazy loading
this.P2P.load.load(this, 'camera_psd', 'public/demos/output/cameras', {
  lazyLoad: true
});

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'camera_psd', 'root');
  
  // Create lazyLoad camera with full debug
  this.lazyCamera = this.P2P.createCamera(this.cameras.main, ['lazyLoad'], {
    lazyLoad: {
      extendPreloadBounds: -30,
      debug: {
        shape: true,  // Show load boundaries
        label: true,  // Show file names
        console: true // Console logging
      }
    }
  });
});" %}

## Combined Camera Features

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

## Camera Events

Both camera features emit events you can listen for:

{% interactive "demos/output/cameras", "camera_events", "// Load scene
this.P2P.load.load(this, 'camera_psd', 'public/demos/output/cameras');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'camera_psd', 'root');
  
  // Create camera with events
  this.eventCamera = this.P2P.createCamera(this.cameras.main, ['draggable']);
  
  // Listen for drag events
  this.events.on('draggableStart', () => {
    console.log('Drag started!');
  });
  
  this.events.on('draggableActive', () => {
    console.log('Dragging...');
  });
  
  this.events.on('draggableComplete', () => {
    console.log('Drag completed!');
  });
});" %}

## LazyLoad Events

LazyLoad cameras emit specific loading events:

```javascript
// LazyLoad event listeners
this.events.on('lazyLoadStart', (progress, currentlyLoading) => {
  console.log(`Loading started: ${progress}% complete`);
});

this.events.on('lazyLoadProgress', (progress, currentlyLoading) => {
  console.log(`Loading: ${progress}% complete`);
  console.log('Currently loading:', currentlyLoading);
});

this.events.on('lazyLoadingComplete', () => {
  console.log('All lazy loading complete!');
});
```

## LazyLoad with Zoom

When using camera zoom with lazyLoad, you may want to use the boundary camera option:

{% interactive "demos/output/cameras", "lazy_load_zoom", "// Load with lazy loading
this.P2P.load.load(this, 'camera_psd', 'public/demos/output/cameras', {
  lazyLoad: true
});

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'camera_psd', 'root');
  
  // LazyLoad camera with zoom support
  this.zoomCamera = this.P2P.createCamera(this.cameras.main, ['lazyLoad'], {
    lazyLoad: {
      createBoundaryCamera: true, // Maintains accurate bounds when zoomed
      debug: { shape: true }
    }
  });
  
  // Add zoom controls
  this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
    const zoom = this.cameras.main.zoom;
    const newZoom = Phaser.Math.Clamp(zoom + (deltaY > 0 ? -0.1 : 0.1), 0.5, 2);
    this.cameras.main.setZoom(newZoom);
  });
});" %}

## Targeting Specific PSDs

By default, camera features apply to all PSDs. You can target specific PSDs:

```javascript
// Target only specific PSDs for lazy loading
this.selectiveCamera = this.P2P.createCamera(this.cameras.main, ['lazyLoad'], {
  lazyLoad: {
    targetKeys: ['background_psd', 'ui_psd'], // Only these PSDs
    debug: { console: true }
  }
});
```

Camera features provide essential functionality for creating responsive, performance-optimized games with large worlds and complex asset loading requirements.