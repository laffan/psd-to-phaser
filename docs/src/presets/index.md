---
layout: base.njk
title: Presets Overview
---

# Presets

P2P comes with built-in preset functions that help you implement common game patterns quickly. These are accessed through the `P2P.use` class and provide ready-made solutions for buttons, parallax effects, joysticks, and more.

## Available Presets

### [Button](/presets/button/)
Create interactive buttons with visual states and customizable callbacks.

### [Parallax](/presets/parallax/)
Make objects move at different speeds than the camera for depth effects.

### [Pan To](/presets/panto/)
Smoothly pan the camera to specific objects or coordinates.

### [Fill Zone](/presets/fillzone/)
Randomly fill zones with sprites for decorative effects.

### [Joystick](/presets/joystick/)
Create draggable joystick controls that return normalized movement values.

## Example: Multiple Presets

{% interactive "demos/output/presets", "multiple_presets", "// Load UI elements
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const ui = this.P2P.place(this, 'presets_psd', 'root');
  
  // Button preset
  const button = ui.target('menu_button');
  this.P2P.use.button([button, () => {
    console.log('Menu button clicked!');
  }]);
  
  // Parallax preset
  const background = ui.target('background');
  this.P2P.use.parallax({
    target: background,
    scrollFactor: 0.3
  });
  
  // Draggable camera for testing parallax
  this.P2P.createCamera(this.cameras.main, ['draggable']);
  
  console.log('Multiple presets working together!');
});" %}

## Benefits of Using Presets

- **Rapid Development**: Implement common patterns in seconds
- **Consistent Behavior**: Well-tested, reliable interactions
- **Event Integration**: All presets emit useful events
- **Customization**: Flexible options for different use cases
- **Mobile Support**: Touch-friendly implementations
- **Performance**: Optimized for smooth gameplay

The preset system handles complex interaction logic so you can focus on your game's unique features and content.