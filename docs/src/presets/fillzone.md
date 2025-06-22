---
layout: base.njk
title: Fill Zone Preset
---

# Fill Zone Preset

Randomly fill zones with sprites for decorative effects, creating dynamic environments with scattered objects like stars, particles, vegetation, or debris.

## Basic Fill Zone

{% interactive "demos/output/presets", "fill_zone_basic", "// Load zone and sprite
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'fill_scene');
  
  // Get zone and sprite to fill with
  const fillZone = scene.target('decoration_zone');
  const fillSprite = scene.target('star_sprite');
  
  // Fill zone with sprites
  this.P2P.use.fillZone(fillZone, fillSprite);
  
  console.log('Zone filled with random sprites!');
});" %}

## Fill Zone with Options

Customize the filling behavior with various options:

{% interactive "demos/output/presets", "fill_zone_options", "// Load zone and sprite
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'customization_scene');
  
  const zone = scene.target('custom_zone');
  const sprite = scene.target('decoration');
  
  // Fill with custom options
  this.P2P.use.fillZone(zone, sprite, {
    count: 20,                    // Number of sprites to place
    scaleRange: [0.5, 1.5],      // Random scale between 0.5x and 1.5x
    tint: [0xff6b6b, 0x4ecdc4, 0x45b7d1], // Random tints
    alpha: 0.8                   // Set opacity
  });
});" %}

## Fill with Spritesheet Frames

Use specific frames from spritesheets or atlases:

{% interactive "demos/output/presets", "fill_zone_frames", "// Load spritesheet
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'spritesheet_scene');
  
  const zone = scene.target('variety_zone');
  const spritesheet = scene.target('decoration_sheet');
  
  // Fill using specific frames
  this.P2P.use.fillZone(zone, spritesheet, {
    useFrames: [0, 2, 4],        // Use frames 0, 2, and 4
    count: 15,
    scaleRange: [0.8, 1.2],
    tint: [0xffffff, 0xffff00, 0xff00ff]
  });
});" %}

## Multiple Fill Zones

Fill different zones with different sprites:

{% interactive "demos/output/presets", "multiple_fill_zones", "// Load multiple zones and sprites
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'environment_scene');
  
  // Forest zone with trees
  const forestZone = scene.target('forest_zone');
  const treeSprite = scene.target('tree');
  this.P2P.use.fillZone(forestZone, treeSprite, {
    count: 8,
    scaleRange: [0.8, 1.3],
    tint: [0x228B22, 0x32CD32, 0x006400]
  });
  
  // Sky zone with clouds
  const skyZone = scene.target('sky_zone');
  const cloudSprite = scene.target('cloud');
  this.P2P.use.fillZone(skyZone, cloudSprite, {
    count: 5,
    scaleRange: [0.6, 1.1],
    alpha: 0.7
  });
  
  // Ground zone with rocks
  const groundZone = scene.target('ground_zone');
  const rockSprite = scene.target('rock');
  this.P2P.use.fillZone(groundZone, rockSprite, {
    count: 12,
    scaleRange: [0.4, 0.9],
    tint: [0x696969, 0x778899, 0x2F4F4F]
  });
});" %}

## Dynamic Fill Zone

Fill zones based on game events or conditions:

{% interactive "demos/output/presets", "dynamic_fill_zone", "// Load interactive scene
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'dynamic_scene');
  
  const zone = scene.target('dynamic_zone');
  const particle = scene.target('magic_particle');
  const button = scene.target('magic_button');
  
  let fillCount = 0;
  
  // Button to add more fill
  this.P2P.use.button([button, () => {
    fillCount += 5;
    
    // Clear and refill with new count
    zone.clear(); // Clear existing fill
    this.P2P.use.fillZone(zone, particle, {
      count: fillCount,
      scaleRange: [0.3, 0.8],
      tint: [0xff69b4, 0x00ffff, 0xffff00],
      alpha: 0.9
    });
    
    console.log(`Zone now has ${fillCount} particles`);
  }]);
  
  console.log('Click button to add more particles!');
});" %}

## Configuration Options

```javascript
this.P2P.use.fillZone(zone, sprite, {
  count: 10,                    // Number of sprites to place (default: 10)
  useFrames: [0, 1, 2],        // Specific frames to use (for spritesheets/atlases)
  scaleRange: [0.8, 1.2],      // Random scale range [min, max]
  tint: [0xff0000, 0x00ff00],  // Array of possible tints
  alpha: 1.0,                  // Opacity of placed sprites
  rotation: true,              // Enable random rotation
  rotationRange: [0, Math.PI * 2] // Rotation range [min, max] in radians
});
```

## Use Cases

Fill Zone is perfect for:

- **Environmental decoration**: Trees, rocks, grass, flowers
- **Particle effects**: Stars, sparkles, magical effects
- **Atmospheric elements**: Clouds, raindrops, snow
- **Game world details**: Debris, coins, collectibles
- **Background elements**: Distant objects, space dust
- **Procedural content**: Random placement of game elements

## Performance Considerations

- Use reasonable sprite counts (10-50 per zone)
- Consider using object pooling for dynamic fills
- Test performance on target devices
- Use lower counts on mobile devices
- Group similar objects when possible

## Tips

- Combine with parallax for layered environmental effects
- Use alpha values for subtle background elements
- Vary tints to create color variety from single sprites
- Consider sprite depth when filling multiple zones
- Use random scales to create natural variation

The Fill Zone preset makes it easy to create rich, detailed environments with minimal setup, adding visual depth and interest to your game worlds.