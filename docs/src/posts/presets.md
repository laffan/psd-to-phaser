---
layout: base.njk
title: Presets
---

# Presets

P2P comes with built-in preset functions that help you implement common game patterns quickly. These are accessed through the `P2P.use` class and provide ready-made solutions for buttons, parallax effects, joysticks, and more.

## Button Preset

Create interactive buttons with visual states and customizable callbacks:

{% interactive "demos/output/presets", "simple_button", "// Load PSD with button graphics
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const ui = this.P2P.place(this, 'presets_psd', 'buttons');
  
  // Get button sprites
  const normalBtn = ui.target('button_normal');
  const hoverBtn = ui.target('button_hover');
  
  // Simple button with click callback
  this.P2P.use.button([normalBtn, (btn) => {
    console.log('Button clicked!');
  }]);
});" %}

## Button with Hover States

Buttons can have multiple visual states for better user feedback:

{% interactive "demos/output/presets", "button_states", "// Load button graphics
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const ui = this.P2P.place(this, 'presets_psd', 'buttons');
  
  // Get all button state graphics
  const normalBtn = ui.target('button_normal');
  const hoverBtn = ui.target('button_hover');
  const activeBtn = ui.target('button_active');
  
  // Button with hover state (3-parameter shorthand)
  this.P2P.use.button([normalBtn, hoverBtn, (btn) => {
    console.log('Enhanced button clicked!');
  }]);
});" %}

## Full Button Configuration

For complete control, use the full object syntax with all callbacks:

{% interactive "demos/output/presets", "full_button", "// Load button graphics
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const ui = this.P2P.place(this, 'presets_psd', 'buttons');
  
  const normalBtn = ui.target('button_normal');
  const hoverBtn = ui.target('button_hover'); 
  const activeBtn = ui.target('button_active');
  
  // Full button configuration
  this.P2P.use.button([
    {
      normal: normalBtn,
      hover: hoverBtn,
      active: activeBtn
    },
    {
      click: (btn) => console.log('Clicked!'),
      mouseOver: (btn) => console.log('Mouse over'),
      mouseOut: (btn) => console.log('Mouse out'),
      mousePress: (btn) => console.log('Pressed down')
    }
  ]);
});" %}

## Parallax Effect

Make objects move at different speeds than the camera for depth illusion:

{% interactive "demos/output/presets", "parallax_basic", "// Load scene with background elements
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'root');
  
  // Get distant background element
  const distantMountains = scene.target('background');
  
  // Apply parallax effect (moves slower than camera)
  this.P2P.use.parallax({
    target: distantMountains,
    scrollFactor: 0.3
  });
  
  // Add draggable camera to test parallax
  this.P2P.createCamera(this.cameras.main, ['draggable']);
  
  console.log('Drag to see parallax effect!');
});" %}

## Pan To Objects

Smoothly pan the camera to specific objects or coordinates:

{% interactive "demos/output/presets", "pan_to", "// Load scene with points of interest
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'root');
  
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

## Pan To Events

Listen for pan progress and completion:

{% interactive "demos/output/presets", "pan_events", "// Load scene
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'root');
  const target = scene.target('point_of_interest');
  
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
  this.time.delayedCall(1000, () => {
    this.P2P.use.panTo(this.cameras.main, target, { speed: 2000 });
  });
});" %}

## Fill Zone with Sprites

Randomly fill zones with sprites for decorative effects:

{% interactive "demos/output/presets", "fill_zone", "// Load zone and sprite
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'root');
  
  // Get zone and sprite to fill with
  const fillZone = scene.target('fill_zone');
  const fillSprite = scene.target('fill_sprite');
  
  // Fill zone with sprites
  this.P2P.use.fillZone(fillZone, fillSprite, {
    scaleRange: [0.5, 1.2],
    tint: [0xff6b6b, 0x4ecdc4, 0x45b7d1],
    count: 15
  });
});" %}

## Basic Joystick

Create draggable joystick controls that return normalized values:

{% interactive "demos/output/presets", "joystick_basic", "// Load joystick components
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const ui = this.P2P.place(this, 'presets_psd', 'joystick');
  
  // Get joystick components
  const joyZone = ui.target('joy_zone');
  const joyStick = ui.target('joy_stick');
  
  // Create basic joystick
  this.P2P.use.joystick(joyStick, joyZone, 'playerJoy');
  
  console.log('Drag the joystick!');
});" %}

## Joystick with Bounce Back

Joysticks can return to center when released:

{% interactive "demos/output/presets", "joystick_bounce", "// Load joystick
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const ui = this.P2P.place(this, 'presets_psd', 'joystick');
  
  const joyZone = ui.target('joy_zone');
  const joyStick = ui.target('joy_stick');
  
  // Joystick with bounce back
  this.P2P.use.joystick(joyStick, joyZone, 'playerJoy', {
    bounceBack: true
  });
  
  console.log('Release to see bounce back!');
});" %}

## Joystick Events and Control

Joysticks emit events with normalized movement values:

{% interactive "demos/output/presets", "joystick_control", "// Load joystick and player
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const ui = this.P2P.place(this, 'presets_psd', 'joystick');
  const player = ui.target('player');
  
  const joyZone = ui.target('joy_zone');
  const joyStick = ui.target('joy_stick');
  
  // Create joystick with control
  this.P2P.use
    .joystick(joyStick, joyZone, 'playerJoy', { bounceBack: true })
    .control(player, {
      type: 'speed',
      maxSpeed: 200
    });
  
  // Listen for joystick events
  this.events.on('joystickActive', (values) => {
    const joy = values.playerJoy;
    console.log(`Joystick: x=${joy.normalized.x.toFixed(2)}, y=${joy.normalized.y.toFixed(2)}`);
  });
});" %}

## Multiple Joysticks

You can use multiple joysticks simultaneously:

{% interactive "demos/output/presets", "dual_joysticks", "// Load dual joystick setup
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const ui = this.P2P.place(this, 'presets_psd', 'dual_joysticks');
  
  // Enable multiple touch points
  this.input.addPointer(2);
  
  // Left joystick (movement)
  const leftZone = ui.target('left_zone');
  const leftStick = ui.target('left_stick');
  this.P2P.use.joystick(leftStick, leftZone, 'movement', { bounceBack: true });
  
  // Right joystick (camera)
  const rightZone = ui.target('right_zone');
  const rightStick = ui.target('right_stick');
  this.P2P.use.joystick(rightStick, rightZone, 'camera', { bounceBack: true });
  
  console.log('Use both joysticks!');
});" %}

## Preset Benefits

The preset system provides:

- **Rapid Prototyping**: Quickly implement common patterns
- **Consistent Behavior**: Well-tested, reliable interactions  
- **Event Integration**: All presets emit useful events
- **Customization**: Flexible options for different use cases
- **Mobile Support**: Touch-friendly implementations
- **Performance**: Optimized for smooth gameplay

These presets handle the complex interaction logic so you can focus on your game's unique features and content.