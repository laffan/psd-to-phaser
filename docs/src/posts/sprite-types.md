---
layout: base.njk
title: Sprite Types
---

# Sprite Types

In the PSD, each layer can be given a type which tells psd-to-json what kind of image to create and how it should be represented in the JSON. The most common types are sprites, tiles, and animations.

For more information on how to properly name these in the PSD, check out the [psd-to-json documentation](https://github.com/laffan/psd-to-json).

## Basic Sprites

Most layers will be simple sprites - static images that can be placed and transformed:

{% interactive "demos/output/sprites", "basic_sprites", "// Load PSD with various sprite types
this.P2P.load.load(this, 'sprites_psd', 'public/demos/output/sprites');

this.events.once('psdLoadComplete', () => {
  // Place different sprite types
  const sprites = this.P2P.place(this, 'sprites_psd', 'root');
  sprites.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
  sprites.setScale(2);
});" %}

## Animations

Animation layers automatically play when placed. You can control animation properties in several ways:

### Layer Naming in PSD

In the PSD itself, you can embed animation parameters directly in the layer name:

```
S | bounce | animation | frameRate: 5, yoyo: true
```

### Animation at Instantiation

You can pass animation parameters when placing the sprite:

{% interactive "demos/output/sprites", "animation_options", "// Load PSD with animation
this.P2P.load.load(this, 'sprites_psd', 'public/demos/output/sprites');

this.events.once('psdLoadComplete', () => {
  // Place animation with custom options
  const bounce = this.P2P.place(this, 'sprites_psd', 'bounce', {
    animationOptions: {
      frameRate: 8,
      yoyo: true,
      repeat: -1
    }
  });
  
  bounce.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
  bounce.setScale(3);
});" %}

### Updating Animations

You can modify animation properties after placement using `updateAnimation()`:

{% interactive "demos/output/sprites", "update_animation", "// Load PSD with animation
this.P2P.load.load(this, 'sprites_psd', 'public/demos/output/sprites');

this.events.once('psdLoadComplete', () => {
  // Place animation
  const bounce = this.P2P.place(this, 'sprites_psd', 'bounce');
  bounce.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
  bounce.setScale(3);
  
  // Update animation after 2 seconds
  this.time.delayedCall(2000, () => {
    bounce.updateAnimation({
      frameRate: 2,
      yoyo: false,
      repeat: 3
    });
    console.log('Animation updated!');
  });
});" %}

## Spritesheets and Atlases

Spritesheets and atlases allow you to use individual frames for particles or other effects:

{% interactive "demos/output/sprites", "spritesheet_particles", "// Load PSD with spritesheet
this.P2P.load.load(this, 'sprites_psd', 'public/demos/output/sprites');

this.events.once('psdLoadComplete', () => {
  // Get spritesheet texture
  const spritesheetTex = this.P2P.getTexture(this, 'sprites_psd', 'spritesheet');
  
  // Create particle emitter using spritesheet frames
  const particles = this.add.particles(
    this.cameras.main.centerX, 
    this.cameras.main.centerY, 
    spritesheetTex, {
      frame: [0, 1, 2, 3],
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      lifespan: 2000,
      frequency: 100
    }
  );
  
  // Ensure particles appear above other elements
  particles.setDepth(100);
});" %}

## Atlas Frames

When working with atlases, you can access individual named frames:

{% interactive "demos/output/sprites", "atlas_frames", "// Load PSD with atlas
this.P2P.load.load(this, 'sprites_psd', 'public/demos/output/sprites');

this.events.once('psdLoadComplete', () => {
  // Get atlas texture
  const atlasTex = this.P2P.getTexture(this, 'sprites_psd', 'atlas');
  
  // Create particles with specific atlas frames
  const particles = this.add.particles(
    this.cameras.main.centerX, 
    this.cameras.main.centerY, 
    atlasTex, {
      frame: ['redDot', 'blueDot', 'greenDot'],
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      lifespan: 1500
    }
  );
  
  // Place individual atlas frame as sprite
  const redSprite = this.add.sprite(100, 100, atlasTex, 'redDot');
  redSprite.setDepth(100);
  redSprite.setScale(2);
});" %}

## Tiles

Tile layers are optimized for repeated patterns and large backgrounds:

{% interactive "demos/output/sprites", "tile_layers", "// Load PSD with tiles
this.P2P.load.load(this, 'sprites_psd', 'public/demos/output/sprites');

this.events.once('psdLoadComplete', () => {
  // Place tile background
  const tiles = this.P2P.place(this, 'sprites_psd', 'tileBackground');
  tiles.setPosition(0, 0);
  
  // Tiles automatically repeat to fill their defined area
  console.log('Tile layer placed');
});" %}

## Working with Different Types

Each sprite type can be manipulated using the same methods, but they have different optimizations:

- **Sprites**: Best for individual objects, characters, UI elements
- **Animations**: Automatically play frame sequences
- **Spritesheets**: Multiple frames in a grid, good for animations and particles
- **Atlases**: Named frames packed efficiently, ideal for UI and varied sprites
- **Tiles**: Optimized for repeated patterns and large backgrounds

The plugin handles all the complexity of loading and setting up these different types - you just need to name them correctly in your PSD using the psd-to-json conventions.