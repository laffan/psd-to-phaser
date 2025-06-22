---
layout: base.njk
title: Placing Layers
---

# Placing Layers

The `place()` method is how you render loaded PSD layers to your Phaser scene. You can place entire groups, individual sprites, or specific nested elements using a simple path syntax. The placement system supports depth control, targeting specific items, and applying transformations to groups.

## Basic Placement

Here's the simplest example - placing the entire PSD:

{% interactive "demos/output/placement", "basic_place", "// Load the PSD
this.P2P.load.load(this, 'demo_psd', 'public/demos/output/placement');

this.events.once('psdLoadComplete', () => {
  // Place everything at once
  const everything = this.P2P.place(this, 'demo_psd', 'dots');
  
  // Center and scale for visibility
  everything.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
  everything.setScale(6);
});" %}

## Placing Individual Elements

You can also place specific elements using slash notation:

{% interactive "demos/output/placement", "individual_place", "// Load the PSD
this.P2P.load.load(this, 'demo_psd', 'public/demos/output/placement');

this.events.once('psdLoadComplete', () => {
  // Place just the background
  const bg = this.P2P.place(this, 'demo_psd', 'background');
  bg.setPosition(50, 50);
  bg.setScale(4);
  
  // Place the dots group separately
  const dots = this.P2P.place(this, 'demo_psd', 'dots');
  dots.setPosition(200, 100);
  dots.setScale(6);
  
  // Place individual dots with different positions
  const dot1 = this.P2P.place(this, 'demo_psd', 'dots/dot');
  dot1.setPosition(100, 200);
  dot1.setScale(8);
  
  const dot2 = this.P2P.place(this, 'demo_psd', 'dots/dot copy');
  dot2.setPosition(200, 200);
  dot2.setScale(8);
});" %}

## Using Sprite Methods on Groups

When you place a group, you get back an object that supports common Phaser sprite methods. These methods are applied to all sprites in the group:

{% interactive "demos/output/placement", "group_methods", "// Load the PSD
this.P2P.load.load(this, 'demo_psd', 'public/demos/output/placement');

this.events.once('psdLoadComplete', () => {
  // Place the dots group
  const dots = this.P2P.place(this, 'demo_psd', 'dots');
  
  // Center and scale
  dots.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
  dots.setScale(8);
  
  // Apply effects to the entire group
  dots.setAlpha(0.8);
  dots.setTint(0x00ff00); // Green tint
  
  // Animate the group
  this.tweens.add({
    targets: dots,
    rotation: Math.PI * 2,
    duration: 3000,
    repeat: -1,
    ease: 'Power2'
  });
});" %}

## Targeting Specific Items

Use the `target()` method to select and modify specific items within a placed group:

{% interactive "demos/output/placement", "targeting", "// Load the PSD
this.P2P.load.load(this, 'demo_psd', 'public/demos/output/placement');

this.events.once('psdLoadComplete', () => {
  // Place everything
  const everything = this.P2P.place(this, 'demo_psd', 'dots');
  everything.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
  everything.setScale(6);
  
  // Target specific items and modify them
  everything.target('dot').setTint(0xff0000); // Red
  everything.target('dot copy').setTint(0x0000ff); // Blue
  
  // Animate just one dot
  const blueDot = everything.target('dot copy');
  this.tweens.add({
    targets: blueDot,
    y: '+=20',
    duration: 1000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
});" %}

## Placement Options

You can pass options to control how items are placed:

{% interactive "demos/output/placement", "placement_options", "// Load the PSD
this.P2P.load.load(this, 'demo_psd', 'public/demos/output/placement');

this.events.once('psdLoadComplete', () => {
  // Place with options
  const group = this.P2P.place(this, 'demo_psd', 'dots', {
    depth: 1, // Only place immediate children
    debug: {
      shape: true, // Show outlines
      label: true  // Show labels
    }
  });
  
  group.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
  group.setScale(8);
});" %}

## Working with Textures

Once a sprite has been loaded, you can grab its texture and use it elsewhere:

{% interactive "demos/output/placement", "get_texture", "// Load the PSD
this.P2P.load.load(this, 'demo_psd', 'public/demos/output/placement');

this.events.once('psdLoadComplete', () => {
  // Get texture from loaded sprite
  const dotTexture = this.P2P.getTexture(this, 'demo_psd', 'dots/dot');
  
  // Create new sprites with the texture
  const newSprite1 = this.add.sprite(100, 100, dotTexture);
  const newSprite2 = this.add.sprite(200, 150, dotTexture);
  
  // Set depth to ensure visibility
  newSprite1.setDepth(100);
  newSprite2.setDepth(100);
  
  // Apply different transforms
  newSprite1.setScale(2).setTint(0xff0000);
  newSprite2.setScale(3).setTint(0x00ff00);
});" %}

## Removing Items

Any placed item comes with a `remove()` method for selective destruction:

{% interactive "demos/output/placement", "remove_items", "// Load the PSD
this.P2P.load.load(this, 'demo_psd', 'public/demos/output/placement');

this.events.once('psdLoadComplete', () => {
  // Place everything
  const everything = this.P2P.place(this, 'demo_psd', 'dots');
  everything.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
  everything.setScale(8);
  
  // Remove specific item after 2 seconds
  this.time.delayedCall(2000, () => {
    everything.remove('dot');
    console.log('Removed dot layer');
  });
});" %}

## Path Syntax

The placement system uses a simple path syntax:

- `'root'` - Places everything
- `'layerName'` - Places a specific layer or group
- `'groupName/childName'` - Places a nested item
- `'groupName/subGroup/deepItem'` - Places deeply nested items

The path matches the layer structure from your PSD exactly as exported by psd-to-json.

## Depth Considerations

Because the plugin maintains layer order with `setDepth()`, new items you create may be hidden behind PSD layers. When placing your own items, set their depth higher than the number of PSD layers:

```javascript
// Create your own sprite
const mySprite = this.add.sprite(x, y, texture);
mySprite.setDepth(100); // Ensure it appears above PSD layers
```