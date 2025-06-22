---
layout: base.njk
title: Pan To Preset
---

# Pan To Preset

Smoothly pan the camera to specific objects or coordinates with customizable easing and positioning options.

## Basic Pan To

{% interactive "demos/output/presets", "pan_to_basic", "// Load scene with points of interest
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'pan_scene');
  
  // Get target point
  const targetPoint = scene.target('point_of_interest');
  
  // Pan to the point after 1 second
  this.time.delayedCall(1000, () => {
    this.P2P.use.panTo(this.cameras.main, targetPoint, {
      targetPositionX: 'center',
      targetPositionY: 'center',
      speed: 1500,
      easing: true
    });
  });
});" %}

## Pan To with Positioning

Control exactly where the target appears on screen:

{% interactive "demos/output/presets", "pan_to_positioning", "// Load scene
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'pan_scene');
  const target = scene.target('target_object');
  
  this.time.delayedCall(1000, () => {
    // Pan with custom positioning
    this.P2P.use.panTo(this.cameras.main, target, {
      targetPositionX: 'left',    // 'left', 'center', 'right'
      targetPositionY: 'top',     // 'top', 'center', 'bottom'
      targetOffset: [100, 50],    // Additional x/y offset
      speed: 2000,
      easing: true
    });
  });
});" %}

## Pan To Events

Listen for pan progress and completion:

{% interactive "demos/output/presets", "pan_to_events", "// Load scene
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'pan_scene');
  const target = scene.target('destination');
  
  // Listen for pan events
  this.events.on('panToStart', () => {
    console.log('Pan started');
  });
  
  this.events.on('panToProgress', (value) => {
    console.log(`Pan ${(value * 100).toFixed(1)}% complete`);
  });
  
  this.events.on('panToComplete', () => {
    console.log('Pan completed!');
  });
  
  // Start panning
  this.time.delayedCall(500, () => {
    this.P2P.use.panTo(this.cameras.main, target, { 
      speed: 2000,
      easing: true 
    });
  });
});" %}

## Sequential Pan To

Chain multiple pan operations together:

{% interactive "demos/output/presets", "sequential_pan", "// Load scene with multiple targets
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'tour_scene');
  
  const point1 = scene.target('stop_1');
  const point2 = scene.target('stop_2');
  const point3 = scene.target('stop_3');
  
  let currentStop = 0;
  const stops = [point1, point2, point3];
  
  const panToNext = () => {
    if (currentStop < stops.length) {
      this.P2P.use.panTo(this.cameras.main, stops[currentStop], {
        speed: 1500,
        easing: true
      });
      currentStop++;
    }
  };
  
  // Listen for completion to trigger next pan
  this.events.on('panToComplete', () => {
    this.time.delayedCall(1000, panToNext);
  });
  
  // Start the tour
  this.time.delayedCall(500, panToNext);
});" %}

## Pan To Coordinates

Pan to specific x/y coordinates instead of objects:

{% interactive "demos/output/presets", "pan_to_coords", "// Load scene
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'coordinate_scene');
  
  // Pan to specific coordinates
  this.time.delayedCall(1000, () => {
    this.P2P.use.panTo(this.cameras.main, { x: 500, y: 300 }, {
      targetPositionX: 'center',
      targetPositionY: 'center',
      speed: 1800,
      easing: true
    });
  });
  
  console.log('Panning to coordinates (500, 300)');
});" %}

## Configuration Options

```javascript
this.P2P.use.panTo(camera, target, {
  targetPositionX: 'center',  // 'left', 'center', 'right'
  targetPositionY: 'center',  // 'top', 'center', 'bottom'
  targetOffset: [0, 0],       // Additional [x, y] offset
  speed: 1000,                // Duration in milliseconds
  easing: true                // Enable easing
});
```

## Target Types

Pan To accepts different target types:

- **Sprites/Objects**: `this.P2P.use.panTo(camera, mySprite, options)`
- **Coordinates**: `this.P2P.use.panTo(camera, {x: 100, y: 200}, options)`
- **Positioned Objects**: Any object with x/y properties

## Events Reference

- **`panToStart`** - Fired when panning begins
- **`panToProgress`** - Fired during panning with completion percentage (0-1)
- **`panToComplete`** - Fired when panning finishes

## Use Cases

Pan To is perfect for:

- **Cutscenes**: Direct attention to important events
- **Tutorials**: Guide players to specific areas
- **Level transitions**: Smooth camera movement between areas
- **Menu navigation**: Cinematic transitions between menu sections
- **Story moments**: Focus on characters or objects during dialogue

The Pan To preset provides smooth, professional camera movement that enhances the cinematic quality of your games.