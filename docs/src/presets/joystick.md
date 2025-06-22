---
layout: base.njk
title: Joystick Preset
---

# Joystick Preset

Create draggable joystick controls that return normalized movement values. Perfect for mobile games and any situation where you need analog input controls.

## Basic Joystick

{% interactive "demos/output/presets", "joystick_basic", "// Load joystick components
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const ui = this.P2P.place(this, 'presets_psd', 'joystick_scene');
  
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
  const ui = this.P2P.place(this, 'presets_psd', 'bounce_joystick');
  
  const joyZone = ui.target('zone');
  const joyStick = ui.target('stick');
  
  // Joystick with bounce back
  this.P2P.use.joystick(joyStick, joyZone, 'playerJoy', {
    bounceBack: true
  });
  
  console.log('Release to see bounce back!');
});" %}

## Joystick Events and Values

Listen for joystick events to get movement data:

{% interactive "demos/output/presets", "joystick_events", "// Load joystick
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const ui = this.P2P.place(this, 'presets_psd', 'event_joystick');
  
  const joyZone = ui.target('event_zone');
  const joyStick = ui.target('event_stick');
  
  this.P2P.use.joystick(joyStick, joyZone, 'eventJoy', {
    bounceBack: true
  });
  
  // Listen for joystick events
  this.events.on('joystickStart', (values) => {
    console.log('Joystick activated');
  });
  
  this.events.on('joystickActive', (values) => {
    const joy = values.eventJoy;
    console.log(`X: ${joy.normalized.x.toFixed(2)}, Y: ${joy.normalized.y.toFixed(2)}`);
  });
  
  this.events.on('joystickRelease', (values) => {
    console.log('Joystick released');
  });
});" %}

## Joystick with Object Control

Use the built-in control system to move objects:

{% interactive "demos/output/presets", "joystick_control", "// Load joystick and player
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'control_scene');
  
  const player = scene.target('player');
  const joyZone = scene.target('control_zone');
  const joyStick = scene.target('control_stick');
  
  // Create joystick with speed control
  this.P2P.use
    .joystick(joyStick, joyZone, 'playerControl', { bounceBack: true })
    .control(player, {
      type: 'speed',
      maxSpeed: 200
    });
  
  console.log('Move the joystick to control the player!');
});" %}

## Multiple Joysticks

Use multiple joysticks for complex controls:

{% interactive "demos/output/presets", "dual_joysticks", "// Load dual joystick setup
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const ui = this.P2P.place(this, 'presets_psd', 'dual_setup');
  
  // Enable multiple touch points
  this.input.addPointer(2);
  
  // Left joystick (movement)
  const leftZone = ui.target('left_zone');
  const leftStick = ui.target('left_stick');
  this.P2P.use.joystick(leftStick, leftZone, 'movement', { 
    bounceBack: true 
  });
  
  // Right joystick (camera/aim)
  const rightZone = ui.target('right_zone');
  const rightStick = ui.target('right_stick');
  this.P2P.use.joystick(rightStick, rightZone, 'camera', { 
    bounceBack: true 
  });
  
  // Listen to both joysticks
  this.events.on('joystickActive', (values) => {
    if (values.movement && values.movement.isActive) {
      console.log('Movement:', values.movement.normalized);
    }
    if (values.camera && values.camera.isActive) {
      console.log('Camera:', values.camera.normalized);
    }
  });
  
  console.log('Use both joysticks simultaneously!');
});" %}

## Control Types

The control system offers different movement types:

{% interactive "demos/output/presets", "control_types", "// Load control demo
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'presets_psd', 'control_types');
  
  const player = scene.target('demo_player');
  const joyZone = scene.target('demo_zone');
  const joyStick = scene.target('demo_stick');
  
  // Speed control (smooth movement)
  this.P2P.use
    .joystick(joyStick, joyZone, 'demoJoy', { bounceBack: true })
    .control(player, {
      type: 'speed',        // 'speed', 'velocity', 'unit', 'tracked'
      maxSpeed: 150,        // Maximum movement speed
      force: 2,             // Force multiplier (for velocity type)
      multiplier: 1.5,      // Position multiplier (for tracked type)
      pixels: 50,           // Pixels per move (for unit type)
      repeatRate: 100,      // Repeat interval (for unit type)
      directionLock: false  // 4, 8, or false for direction locking
    });
});" %}

## Joystick Configuration

```javascript
// Basic joystick setup
this.P2P.use.joystick(stickSprite, zoneSprite, 'uniqueKey', {
  bounceBack: true    // Return to center when released
});

// Joystick with control
this.P2P.use
  .joystick(stickSprite, zoneSprite, 'uniqueKey', { bounceBack: true })
  .control(targetSprite, {
    type: 'speed',           // Control type
    maxSpeed: 200,           // Speed-based movement
    force: 2,                // Physics force (velocity type)
    multiplier: 1.3,         // Position multiplier (tracked type)
    pixels: 100,             // Pixels per move (unit type)
    repeatRate: 300,         // Repeat rate (unit type)
    directionLock: false     // Direction constraints
  });
```

## Control Types

- **speed**: Standard position-based movement with max speed
- **velocity**: Apply physics velocity to objects (requires physics body)
- **unit**: Move specific pixel amounts with repeat timing
- **tracked**: 1-to-1 tracking with optional multiplier

## Direction Locking

- **4**: Lock to cardinal directions (up, down, left, right)
- **8**: Lock to 8 directions (cardinals + diagonals)
- **false**: Free movement in any direction

## Joystick Events

- **joystickStart**: Fired when joystick is first touched
- **joystickActive**: Fired continuously while joystick is being used
- **joystickRelease**: Fired when joystick is released

## Values Object Structure

```javascript
{
  joystickKey: {
    isActive: boolean,           // Is currently being used
    position: {x: 100, y: 30},  // Current stick position
    change: {x: 30, y: -3},     // Offset from center
    normalized: {x: 0.3, y: -0.6} // Normalized values (-1 to 1)
  }
}
```

## Use Cases

Joysticks are perfect for:

- **Mobile games**: Touch-friendly character movement
- **Twin-stick shooters**: Separate movement and aiming controls
- **Racing games**: Steering and acceleration controls
- **Menu navigation**: Analog menu browsing
- **Camera controls**: Smooth camera movement
- **Accessibility**: Alternative input methods

The joystick preset provides professional, responsive analog controls that work seamlessly across desktop and mobile platforms.