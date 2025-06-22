---
layout: base.njk
title: Draggable Camera
---

# Draggable Camera

The draggable camera lets you click and drag around the canvas with desktop and mobile support. It includes easing features and boundary controls for smooth, responsive camera movement.

## Basic Draggable Camera

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

## Draggable with Boundaries

Set movement boundaries to keep the camera within specific areas:

{% interactive "demos/output/cameras", "draggable_bounds", "// Load scene
this.P2P.load.load(this, 'camera_psd', 'public/demos/output/cameras');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'camera_psd', 'root');
  
  // Draggable camera with strict boundaries
  this.boundedCam = this.P2P.createCamera(this.cameras.main, ['draggable'], {
    draggable: {
      useBounds: { x: 0, y: 0, width: 1000, height: 1000 },
      easeDragging: false // Immediate response
    }
  });
  
  console.log('Camera is bounded to a specific area');
});" %}

## Draggable with Easing

Easing creates smooth, natural camera movement:

{% interactive "demos/output/cameras", "draggable_easing", "// Load scene
this.P2P.load.load(this, 'camera_psd', 'public/demos/output/cameras');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'camera_psd', 'root');
  
  // Draggable camera with custom easing
  this.easyCam = this.P2P.createCamera(this.cameras.main, ['draggable'], {
    draggable: {
      easeDragging: true,
      friction: 0.9,      // Higher = more slippery
      minSpeed: 0.5       // Minimum speed before stopping
    }
  });
  
  console.log('Smooth eased dragging!');
});" %}

## Draggable Events

Listen for drag events to trigger other game behaviors:

{% interactive "demos/output/cameras", "draggable_events", "// Load scene
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

## Mobile Support

The draggable camera automatically supports both desktop and mobile interactions:

{% interactive "demos/output/cameras", "draggable_mobile", "// Load scene
this.P2P.load.load(this, 'camera_psd', 'public/demos/output/cameras');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'camera_psd', 'root');
  
  // Mobile-optimized draggable camera
  this.mobileCam = this.P2P.createCamera(this.cameras.main, ['draggable'], {
    draggable: {
      easeDragging: true,
      friction: 0.95,
      minSpeed: 0.1
    }
  });
  
  console.log('Works on both desktop and mobile!');
});" %}

## Draggable Configuration Options

```javascript
this.P2P.createCamera(this.cameras.main, ['draggable'], {
  draggable: {
    useBounds: { x: 0, y: 0, width: 1000, height: 1000 }, // Set boundary rectangle
    easeDragging: true,     // Enable eased dragging
    friction: 0.95,         // Friction coefficient (0-1, higher = more slippery)
    minSpeed: 0.1          // Minimum speed threshold before stopping
  }
});
```

## Draggable Events Reference

- **`draggableStart`** - Fired when dragging begins
- **`draggableActive`** - Fired continuously while dragging
- **`draggableComplete`** - Fired when dragging ends

## Use Cases

The draggable camera is perfect for:

- **Map exploration games** - Let players navigate large worlds
- **Strategy games** - Move around battlefields or city views  
- **Puzzle games** - Explore large puzzle areas
- **Interactive diagrams** - Navigate complex visual information
- **Gallery applications** - Browse large image collections

The draggable camera provides intuitive, responsive navigation that feels natural on both desktop and mobile devices.