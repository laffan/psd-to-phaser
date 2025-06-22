---
layout: base.njk
title: Parallax Preset
---

# Parallax Preset

Make any placed object move at a different speed than the camera scroll, creating a parallax effect that adds depth and visual interest to your scenes.

## Basic Parallax

{% interactive "demos/output/presets", "parallax_basic", "// Load scene with background elements
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'parallax_scene');
  
  // Get distant background element
  const distantMountains = scene.target('mountains');
  
  // Apply parallax effect (moves slower than camera)
  this.P2P.use.parallax({
    target: distantMountains,
    scrollFactor: 0.3
  });
  
  // Add draggable camera to test parallax
  this.P2P.createCamera(this.cameras.main, ['draggable']);
  
  console.log('Drag to see parallax effect!');
});" %}

## Multiple Parallax Layers

Create depth with multiple parallax layers at different speeds:

{% interactive "demos/output/presets", "multi_parallax", "// Load scene with multiple background layers
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'depth_scene');
  
  // Far background (slowest)
  const farBackground = scene.target('far_bg');
  this.P2P.use.parallax({
    target: farBackground,
    scrollFactor: 0.1
  });
  
  // Mid background
  const midBackground = scene.target('mid_bg');
  this.P2P.use.parallax({
    target: midBackground,
    scrollFactor: 0.4
  });
  
  // Near background
  const nearBackground = scene.target('near_bg');
  this.P2P.use.parallax({
    target: nearBackground,
    scrollFactor: 0.7
  });
  
  // Foreground moves at normal speed (1.0)
  
  this.P2P.createCamera(this.cameras.main, ['draggable']);
  console.log('Multiple depth layers!');
});" %}

## Custom Camera Parallax

Apply parallax to a specific camera instead of the main camera:

{% interactive "demos/output/presets", "custom_camera_parallax", "// Load parallax scene
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'parallax_scene');
  
  // Create a secondary camera
  const secondCamera = this.cameras.add(100, 100, 400, 300);
  
  const background = scene.target('background');
  
  // Apply parallax to specific camera
  this.P2P.use.parallax({
    target: background,
    scrollFactor: 0.5,
    camera: secondCamera
  });
  
  // Make secondary camera draggable
  this.P2P.createCamera(secondCamera, ['draggable']);
  
  console.log('Parallax on secondary camera!');
});" %}

## Reverse Parallax

Objects can move faster than the camera for interesting effects:

{% interactive "demos/output/presets", "reverse_parallax", "// Load scene with foreground elements
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'reverse_scene');
  
  // Foreground element moves faster than camera
  const foregroundElement = scene.target('foreground');
  this.P2P.use.parallax({
    target: foregroundElement,
    scrollFactor: 1.5  // Moves faster than camera
  });
  
  // Background moves slower
  const background = scene.target('background');
  this.P2P.use.parallax({
    target: background,
    scrollFactor: 0.3
  });
  
  this.P2P.createCamera(this.cameras.main, ['draggable']);
  console.log('Reverse parallax effect!');
});" %}

## Parallax Configuration

```javascript
this.P2P.use.parallax({
  target: mySprite,        // The object to apply parallax to
  scrollFactor: 0.5,       // Speed relative to camera (0-1 = slower, >1 = faster)
  camera: this.cameras.main // Optional: specific camera (defaults to main)
});
```

## Scroll Factor Guidelines

- **0.0**: Object doesn't move (fixed position)
- **0.1-0.3**: Far background elements (mountains, sky)
- **0.4-0.6**: Mid-distance elements (trees, buildings)
- **0.7-0.9**: Near background elements
- **1.0**: Normal movement (no parallax)
- **1.1-2.0**: Foreground elements (closer than camera plane)

## Use Cases

Parallax effects are perfect for:

- **Side-scrolling games**: Create depth in 2D environments
- **Adventure games**: Make exploration feel more immersive
- **Menu backgrounds**: Add subtle movement to static screens
- **Cinematic sequences**: Create dramatic depth effects
- **Racing games**: Show speed with layered backgrounds

## Performance Tips

- Use parallax sparingly on mobile devices
- Group similar parallax objects when possible
- Consider using fewer parallax layers for better performance
- Test on target devices to ensure smooth frame rates

The parallax preset makes it easy to add professional depth effects that enhance the visual appeal and immersion of your games.