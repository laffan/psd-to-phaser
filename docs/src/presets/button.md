---
layout: base.njk
title: Button Preset
---

# Button Preset

Create interactive buttons with visual states and customizable callbacks. The button preset automatically manages which image is visible based on user interaction and provides mobile-friendly touch support.

## Simple Button

{% interactive "demos/output/presets", "simple_button", "// Load PSD with button graphics
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const ui = this.P2P.place(this, 'presets_psd', 'buttons');
  
  // Get button sprite
  const normalBtn = ui.target('button_normal');
  
  // Simple button with click callback
  this.P2P.use.button([normalBtn, (btn) => {
    console.log('Button clicked!');
  }]);
});" %}

## Button with Hover State

Add visual feedback with hover states (desktop only):

{% interactive "demos/output/presets", "button_hover", "// Load button graphics
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const ui = this.P2P.place(this, 'presets_psd', 'buttons');
  
  // Get button state graphics
  const normalBtn = ui.target('button_normal');
  const hoverBtn = ui.target('button_hover');
  
  // Button with hover state (3-parameter shorthand)
  this.P2P.use.button([normalBtn, hoverBtn, (btn) => {
    console.log('Enhanced button clicked!');
  }]);
});" %}

## Full Button Configuration

For complete control, use the full object syntax with all states and callbacks:

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

## Multiple Buttons

Create multiple buttons with different behaviors:

{% interactive "demos/output/presets", "multiple_buttons", "// Load UI with multiple buttons
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const ui = this.P2P.place(this, 'presets_psd', 'menu');
  
  // Play button
  const playBtn = ui.target('play_button');
  this.P2P.use.button([playBtn, () => {
    console.log('Starting game...');
  }]);
  
  // Settings button
  const settingsBtn = ui.target('settings_button');
  this.P2P.use.button([settingsBtn, () => {
    console.log('Opening settings...');
  }]);
  
  // Quit button
  const quitBtn = ui.target('quit_button');
  this.P2P.use.button([quitBtn, () => {
    console.log('Quitting game...');
  }]);
});" %}

## Interactive Button State Demo

Watch button states change in real-time:

{% interactive "demos/output/presets", "button_states_demo", "// Load button with all states
this.P2P.load.load(this, 'presets_psd', 'public/demos/output/presets');

this.events.once('psdLoadComplete', () => {
  const ui = this.P2P.place(this, 'presets_psd', 'interactive_button');
  
  const normalBtn = ui.target('demo_normal');
  const hoverBtn = ui.target('demo_hover');
  const activeBtn = ui.target('demo_active');
  
  // Button with detailed feedback
  this.P2P.use.button([
    {
      normal: normalBtn,
      hover: hoverBtn,
      active: activeBtn
    },
    {
      click: (btn) => {
        console.log('Button clicked! State returned to normal.');
      },
      mouseOver: (btn) => {
        console.log('Mouse entered button area - showing hover state');
      },
      mouseOut: (btn) => {
        console.log('Mouse left button area - showing normal state');
      },
      mousePress: (btn) => {
        console.log('Button pressed down - showing active state');
      }
    }
  ]);
});" %}

## Button Syntax Options

### Three-Parameter Shorthand
```javascript
// [normal, hover, click_callback]
this.P2P.use.button([normalSprite, hoverSprite, (btn) => {
  console.log('Clicked!');
}]);
```

### Two-Parameter Simple
```javascript
// [normal, click_callback]
this.P2P.use.button([normalSprite, (btn) => {
  console.log('Clicked!');
}]);
```

### Full Object Syntax
```javascript
this.P2P.use.button([
  {
    normal: normalSprite,    // Required
    hover: hoverSprite,      // Optional (desktop only)
    active: activeSprite     // Optional
  },
  {
    click: (btn) => {},      // Triggered on button release
    mouseOver: (btn) => {},  // Triggered when mouse enters (desktop only)
    mouseOut: (btn) => {},   // Triggered when mouse leaves (desktop only)
    mousePress: (btn) => {}  // Triggered when button is pressed down
  }
]);
```

## Image States

- **normal**: Default image (required)
- **hover**: Image shown on mouse over (desktop only, optional)
- **active**: Image shown while pressed down (optional)

## Callback Types

- **click**: Triggered on button release
- **mouseOver**: Triggered when mouse enters button area (desktop only)
- **mouseOut**: Triggered when mouse leaves button area (desktop only)
- **mousePress**: Triggered when button is pressed down

## Mobile Support

- Hover states are automatically disabled on mobile devices
- Touch events work seamlessly with press and click callbacks
- Active states work on both desktop and mobile

## How It Works

The button preset automatically manages which image is visible based on user interaction. Only the appropriate image for the current state is shown, while others are hidden. This creates smooth, responsive button interactions without manual state management.