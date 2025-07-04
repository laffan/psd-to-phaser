# PSD to Phaser

psd-to-phaser is a Phaser plugin that reads the JSON manifest created by [psd-to-json](https://pypi.org/project/psd-to-json/), loads the files and then does the work of rebuilding the PSD. 


It also has some nifty extras like [lazyLoading](#lazyload) and a a few presets that I thought might be useful ([parallax](#parallax) and [build-your-own-joystick](#joystick-sprite-zone-key) being my favorites.)


## Examples

The [example project](/example/README.md) is about as bare-bones as it gets. Demonstrates basic loading and particles.  I'll be adding more examples soon. 

[🖥️ Click here to see it running on codesandbox.io](https://codesandbox.io/p/github/laffan/psd-to-phaser-example-1/).



### Initializing

You can initialize the plugin via when creating the game's configuration object, like so :

```js
new Phaser.Game({
  // ...
  plugins: {
    global: [
      {
        key: "PsdToPhaser",
        plugin: PsdToPhaser,
        start: true,
        mapping: "P2P", // all examples below assume you're mapping to P2P
        data: {
          debug: {
            // can also be set to "true" to have all debug options set to true
            shape: false, // outline all items
            label: false, // text labels for all objects
            console: false, // output placement & progress info to console
          },
          applyAlphaAll: false, // apply alpha value of to all items  by default.
          applyBlendModesAll: false, // apply blendMode of all items by default.
        },
      },
    ],
  },
  // ...
});
```

## Loading and Placing Layers

### load()

When preloading your scene, use P2P.load() by passing in the folder generated by PSDtoJSON. Any assets in the JSON that do not have a `lazyLoad:true` attribute will start loading. Events are emitted as each asset is loaded.

```js
// Load the JSON
this.P2P.load(this, "psd_key", "assets/simple");

// Load with lazyLoad options - set all layers to lazy load
this.P2P.load(this, "psd_key", "assets/simple", {
  lazyLoad: true
});

// Load with lazyLoad options - set specific layers to lazy load
this.P2P.load(this, "psd_key", "assets/simple", {
  lazyLoad: ["background", "monster"]
});

// Listen for asset loading progress
this.events.on("psdLoadProgress", (value) => {
  this.P2PProgress = value;
  this.updateProgress();
});

// Listen for asset loading completion
this.events.once(
  "psdLoadComplete",
  () => {
    console.log("All done!");
  },
  this
);
```

### loadMultiple()

When you need to load multiple PSDs at once with position offsets, use P2P.loadMultiple(). This method takes an array of configuration objects, each specifying the key, path, position, and optional lazyLoad settings.

```js
// Load multiple PSDs with position offsets
this.P2P.loadMultiple(this, [
  {
    key: "background_psd",
    path: "assets/background", 
    position: { x: 0, y: 0 }
  },
  {
    key: "foreground_psd",
    path: "assets/foreground",
    position: { x: 100, y: 50 }
  },
  {
    key: "ui_psd",
    path: "assets/ui",
    position: { x: 0, y: 0 },
    lazyLoad: true // Set all layers in this PSD to lazy load
  },
  {
    key: "effects_psd", 
    path: "assets/effects",
    position: { x: 200, y: 100 },
    lazyLoad: ["particles", "glow"] // Set specific layers to lazy load
  }
]);

// Listen for combined loading progress
this.events.on("psdLoadProgress", (value) => {
  console.log(`Multi-PSD loading: ${(value * 100).toFixed(2)}% complete`);
});

// Listen for completion of all PSDs
this.events.once("psdLoadComplete", () => {
  console.log("All PSDs loaded!");
});
```


#### getData("psd_key")

The `getData()` method returns the base path, where the data has been saved (`basePath`), the JSON manifest in its entirity (`original`), the initially loaded items (`initialLoad`) and finally any items that are being lazy loaded (`lazyLoad`).

```js

    // Save all PSD data to a variable
    const psdData = this.P2P.getData("psd_key");

    // "basePath" is where the PSD data is stored.
    const psdPath = psdData.basePath;

    // "original" is the entire JSON blob. 
    const psdWidth = psdData.original.width;
```



### place()

If you're placing a layer group, all of the descendants will be placed by default. However, place() also lets you place specific descendants using a slash path format. An optional "options" object allows you to limit the recursion ("depth") and set debugging options ("debug").

```js
// Place a top level layer
const psd = this.P2P.place(this, "psd_key", "root");

const sprite = this.P2P.place(this, "psd_key", "root/spiteName");

// Place all the children of a nested group with some optional overrides
const item = this.P2P.place(
  this,
  "psd_key"
  "groupName/nestedGroup",
  {
    depth: 1, // Only place top level items in this group, not the descendants
    ignore: ["background", "sprites/sprite1"], // array of paths to ignore
    debug: {
      shape: true
    },
  }
);
```




#### [placed].[spriteMethods]()

Several sprite methods can be called on a placed group. This just applies the method to each sprite individually. Currently, the list of supported methods (somewhat arbitrarily) includes : 'setAlpha', 'setAngle', 'setBlendMode', 'setDepth', 'setDisplaySize', 'setFlip', 'setMask', 'setOrigin', 'setPipeline', 'setPosition', 'setRotation', 'setScale', 'setScrollFactor', 'setSize', 'setTint', 'setVisible', 'setX', 'setY', 'setZ'.

```js
// Set the alpha and rotation of a group.
const depthTest = this.P2P.place(this, "psd_key", "depthTest");
depthTest.setAlpha(0.3);
depthTest.setRotation(Math.PI / 4);

```


#### [placed].target()

If you would like to target a portion of a placed group - or a portion of a placed group - and assign it to a new variable, you can use the copy() method. You can also deactivate the targeted items in the original, giving the impression that the original object is being affected.

```js
// Place item
const placedGroup = this.P2P.place(this, "psd_key", "placedGroup");

// Use target to apply method to portion of target
const lightened = placedGroup.target("iAmAtlas").setAlpha(0.3);

// Chain several methods on target
placedGroup.target("surround").setAlpha(0.3).setX(200); // chain methods

// Assign target to a new variable and update it that way.
const = L1Text = placedGroup.target("depthTest/Level1/Level1Text");
L1Text.setAlpha(0.3)

// Get  the points which make up a placed Zone
const zone = placedGroup.target("depthTest/zone1");
const points = zone.getData('points');

```


#### [placed].remove()

Any placed item comes with a remove method, which lets you search through the placed structure and destroy certain items.

```js
const placedGroup = this.P2P.place(this, "psd_key", "placedGroup");

placedGroup.remove("innerGroup", { depth: 1 }); // removes only immediate children
placedGroup.remove("innerGroup"); // removes all descendants from this point
```


### getTexture()

Once as sprite has been loaded, you can easily grab its texture and use it elsewhere, like particle emitters or placing individual frames of an atlas or spritesheet.

Note : When placing new items, remember the [depth gotchya](#depth--placing-your-own-items).

```js
// Get the texture of a spritesheet
const spriteTex = this.P2P.getTexture(this, "psd_key", "simpleSprite");
const spritesheetTex = this.P2P.getTexture(this, "psd_key", 'nested/sheet');
const atlasTex = this.P2P.getTexture(this, "psd_key", 'anAtlas');

// Now you have access to just those textures and can use them however you please.
// For example :

// Create the new sprite like you normally would
this.newSprite = this.add.sprite(200, 30, spriteTex);

// Emit spritesheet frames
this.spriteSheetParticles = this.add.particles(200, 30, spritesheetTex, {
  frame: [0, 1, 2, 3],
  speed: 100,
  scale: { start: 1, end: 0 },
});

// Emit atlas frames
this.atlasParticles = this.add.particles(200, 30, atlasTex, {
  frame: ['pinkDot', 'greenDot'],
  speed: 100,
  scale: { start: 1, end: 0 },
});

// Place the 'pinkDot' of the atlas elsewhere in the scene as its own sprite.
const testSprite = this.add.sprite(200, 30, atlasTex, 'pinkDot');

// Avoid the depth gotchya! Make sure these new items are visible
this.newSprite.setDepth(100);
this.atlasParticles.setDepth(100);
this.atlasParticles.setDepth(100);

```

## Sprite Types

In the PSD, each layer can be given a type, which tells the tool what kind of image to create and how it should be represented in the JSON. For more information on how to properly name these in the PSD, check out the [Generator README](https://github.com/laffan/psd-to-phaser/generator/README.md).

### Type : Animation

Animations automatically play when placed. However, you can override the default animation properties at several points.

1. Layer naming : In the PSD itself, the attributes of the layer name itself can control animation properties. If you pass valid animation parameters, they will be merged in when instantiating the animation.

```
S | bounce | animation | frameRate: 5, yoyo: true
```

2. Instantiation : When instantiating the sprite, you can also pass in animation parameters, so the same thing could be acheived like so :

```js
// For individual sprites
this.P2P.place(this, "psd_key", "nested/bounce",   {
    animationOptions: {
      frameRate: 12,
      yoyo: true,
    }
  });

```

3. Using get() : You can always use get() to retreive the sprite and then use updateAnimation():

```js
this.bounce = this.P2P.place(this, "psd_key", "nested/bounce");

this.bounce.updateAnimation({
  frameRate: 5,
  yoyo: true,
});
```

### Debugging

As mentioned [above](#initializing), the plugin features a top-level debug mode you can feed either a boolean or a configuration object that gives you more granular control : `{ label, shape, console}`. "Label" controls the text label of the layer, "shape" is the visual outline of what is being placed on the canvas and "console" just gives you some basic info about the placement.

When placing objects, you can override whatever your global setting is the same way.

```js
// Turn off the text labels
this.P2P.place(this, "psd_key", "backgroundTiles", {
  debug: {
    label: false,
  },
});

// The equivelant of not using debug at all.
this.P2P.place(this, "psd_key", "pickups/deepNestPoints", {
  debug: {
    shape: false,
    label: false,
    console: false,
  },
});
```

## Cameras

P2P has a few camera functions that help optimize your project and get you started with some basic interaction styles.

You can add these functions to any camera by passing it in to the `createCamera` function. The basic syntax is:

```js
this.P2P.createCamera(camera, features, options?)
```

- **camera**: The Phaser camera to enhance (usually `this.cameras.main`)
- **features**: Array of feature names (`['draggable']`, `['lazyLoad']`, etc.)
- **options**: Optional configuration object for the features

At the moment, there are camera features: `lazyLoad` and `draggable`.

**Camera features default to applying to all PSDs.** For `lazyLoad`, you can specify which PSDs to target using the `targetKeys` option.

### LazyLoad

This camera works in conjunction with the `lazyLoad` attribute, which you can set to true on any sprite or tile layer. Sprite or tile layers that have been given the `lazyLoad` attribute will not loaded during load() but later, when they enter the camera. This gives you the ability to load assets only when they're needed, potentially keeping load times much (much) smaller.

**Note:**  : Currently does _not_ work with multiple cameras. Also, there are some tradeoffs to using `lazyLoad`. The biggest difference is that you can't manually place lazily loaded items before the sprite texture has loaded. If the lazyLoad camera is on, they'll just show up when needed.

The other tradeoff is that you MUST use the lazyLoad camera to see lazyLoaded items at all, as the plugin just leaves them out of the initial load sequence. If you do not use a lazyLoad camera and your PSD contains lazyLoad items you will get lots of "Texture not found" errors.

**NOTE : ZOOM BUG**: By default, camera zoom will affects the preload boundaries of your lazyLoad camera, so if you zoom out, the boundary zooms out too.  It turns out this is a difficult fix. As a stopgap, you can set `createBoundaryCamera: true` in your lazy load options. This creates an invisible secondary camera that maintains accurate preload boundaries regardless of the main camera's zoom level. This is a tradeoff: it works, but   will increase processor load somewhat. 

```js
// Initialize a lazyLoad camera (applies to all PSDs by default)
this.lazyCamera = this.P2P.createCamera(this.cameras.main, ["lazyLoad"], {
  lazyLoad: {
    extendPreloadBounds: -30, // pull lazyLoad boundary in to debug
    debug: {
      shape: true, // outline lazyLoad items
      label: true, // label with filename 
      console: true, // show file loading in console
    },
  },
});

// Target specific PSDs only
this.lazyCamera = this.P2P.createCamera(this.cameras.main, ["lazyLoad"], {
  lazyLoad: {
    targetKeys: ["psd_01", "psd_02"], // only lazy load these PSDs
    debug: { console: true },
  },
});

// Use with camera zoom - creates boundary camera unaffected by zoom
this.lazyCamera = this.P2P.createCamera(this.cameras.main, ["lazyLoad"], {
  lazyLoad: {
    extendPreloadBounds: 50,
    createBoundaryCamera: true, // creates invisible camera for accurate boundaries when zoomed
    debug: { shape: true },
  },
});
```

Now P2P is keeping track of where the camera is and whether there is any overlap with the location of sprites or tiles. If there is overlap, it will trigger a load sequence. When lazyLoad items load, they trigger loadProgress events, so you can listen for "lazyLoadStart", "lazyLoadProgress", "lazyLoadingComplete".

```js
// Simple lazyLoad camera for all PSDs
this.lazyCamera = this.P2P.createCamera(this.cameras.main, ["lazyLoad"]);

this.events.on("lazyLoadStart", (progress, currentlyLoading) => {
  console.log(`Loading is ${progress} complete.`);
  console.log(currentlyLoading); // Array of items currently loading
});

this.events.on("lazyLoadProgress", (progress, currentlyLoading) => {
  console.log(`Loading is ${progress} complete.`);
  console.log(currentlyLoading); // Array of items currently loading
});

this.events.on("lazyLoadingComplete", () => {
  console.log(`Lazy loading is complete.`);
});
```

### Draggable

The draggable camera lets you click and drag around the canvas. That's about it. It should work with desktop and mobile and has an easing feature that you can switch on and off.

```js
// Initialize a draggable camera (no psdKey needed)
this.dragCam = this.P2P.createCamera(this.cameras.main, ['draggable']);

// Initialize a draggable camera with options
this.dragCam = this.P2P.createCamera(this.cameras.main, ['draggable'], {
  draggable: {
    useBounds: { x: 0, y: 0, width: 1000, height: 1000 },
    easeDragging: true,
    friction: 0.95,
    minSpeed: 0.1,
  },
});
```

Just like the lazyLoad feature, you can create the camera with defaults and set specific parameters later on.

Dragging triggers events, so you can listen for "dragOnStart", "isDragging" and "dragOnComplete".

```js
this.dragCam = this.P2P.createCamera(this.cameras.main, ["draggable"]);

this.events.on("draggableStart", () => {
  console.log(`Drag has begun.`);
});

this.events.on("draggableActive", () => {
  console.log(`Drag is active.`);
});

this.events.on("draggableComplete", () => {
  console.log(`Drag has completed.`);
});
```

### Combined

And of course you can combine functions to create a supercamera.

```js
// Combined camera with both lazyLoad and draggable features (applies to all PSDs)
this.myCamera = this.P2P.createCamera(this.cameras.main, ['lazyLoad', 'draggable'], {
  lazyLoad: {
    extendPreloadBounds: 10, // extend/contract trigger bounds beyond camera
    debug: {
      shape: true, // draw a shape around the lazyLoad trigger
      label: true, // show labels for lazy load items
      console: true // output lazy load info
    }
  },
  draggable: {
    useBounds: { x: 0, y: 0, width: 1000, height: 1000 }, // set boundary of drag
    easeDragging: true, // use eased dragging
    friction: 0.95, // friction of ease
    minSpeed: 0.1 // minimum speed threshold
  }
});

// Combined camera targeting specific PSDs
this.myCamera = this.P2P.createCamera(this.cameras.main, ['lazyLoad', 'draggable'], {
  lazyLoad: {
    targetKeys: ["background_psd", "foreground_psd"], // only these PSDs
    debug: { console: true }
  },
  draggable: {
    easeDragging: true
  }
});
```



## Presets

P2P comes with a few preset functions built in that help you get started more quickly. These are stored in the 'use' class.

### button()

Create interactive buttons with visual states and customizable callbacks. Accepts two objects: `images` (what is displayed) and `callbacks` (what happens on interaction).

```js
// Simple button with click callback
this.P2P.use.button([this.buttonNormal, (btn) => {
  console.log("clicked");
}]);

// Button with hover image (3-parameter shorthand)
this.P2P.use.button([this.buttonNormal, this.buttonHover, (btn) => {
  console.log("clicked");
}]);

// Full object syntax with all images and callbacks
this.P2P.use.button([
  {
    normal: this.buttonNormal,
    hover: this.buttonHover,
    active: this.buttonPressed
  },
  {
    click: (btn) => console.log("clicked"),
    mouseOver: (btn) => console.log("mouse over"),
    mouseOut: (btn) => console.log("mouse out"),
    mousePress: (btn) => console.log("pressed down")
  }
]);
```

**Image States:**
- **normal**: Default image (required)
- **hover**: Image shown on mouse over (desktop only, optional)
- **active**: Image shown while pressed down (optional)

**Callback Types:**
- **click**: Triggered on button release
- **mouseOver**: Triggered when mouse enters button area (desktop only)
- **mouseOut**: Triggered when mouse leaves button area (desktop only)
- **mousePress**: Triggered when button is pressed down

**How it works:** The button function automatically manages which image is visible based on user interaction. Only the appropriate image for the current state is shown, while others are hidden.

**Mobile Support:** Hover states automatically work on desktop with mouse interaction but are disabled on mobile devices to prevent conflicts with touch events.

### parallax()

Make any placed object move at a different speed than the camera scroll, creating a parallax effect.

```js
const psd = this.P2P.place(this, 'psd_key', 'root');

const distantItem = psd.target('distant');

this.P2P.use.parallax({
  target: distantItem,
  scrollFactor: 0.25
});

```

This defaults to the main camera, but accepts a `camera` parameter, allowing you can pass in a different target camera.

### panTo()

Pass in an item or x/y and have the canvas pan to it.

```js
// Pan to item.
this.P2P.use.panTo(this.cameras.main, this.placedPoint, {
  targetPositionY: "center", // "center", "top", "bottom"
  targetPositionZ: "center", // "center", "left", "right"
  targetOffset: [300, 100], // Adjust target with x/y
  speed: 300, // time in ms it takes to pan to point
  easing: true, // turn easing on/off
});
```

Pans trigger events, so you can listen for "panOnStart", "panProgress" and "panOnComplete".

```js

this.events.on("panToStart", (  ) => {
  console.log(`panTo has started`);
});
this.events.on("panToProgress", ( value ) => {
  console.log(`Pan is ${value} percent complete.`);
});

this.events.on("panToComplete", () => {
  console.log("Pan has completed!");
});

```


### fillZone( zone, sprite )

Randomly fills a zone with a sprite or texture. You can pass in items directly from the JSON or one you've already placed. An optional options object lets you control which frames to use (if using a spritesheet or atlas) as well as size and tint options.

```js
// Fill a zone with sprites.
this.P2P.use.fillZone(this.myZone, this.mySprite);

this.P2P.use.fillZone(this.myZone, this.mySpritesheet, {
  useFrames: [1, 3], // optionally use only these frames from the spritesheet or atlas
  scaleRange: [0.8, 1.1], // optionally randomly scale items within these bounds.
  tint: [0x15ae15, 0xdaaf3a, 0xda3a64], // optionally apply these tints to the placed items
});

```

### joystick( sprite, zone, key)

Joystick allows you to move combine any sprite and zone to create a draggable "joystick" within the bounds of the zone that returns normalized x/y values. Because you may want to use multiple joysticks at once,
each joystick requires its own key.

```js
//  mySprite is now draggable, bounded by myZone. Position is fixed on release.
this.P2P.use.joystick(this.mySprite, this.myZone, "joystickA");

this.P2P.use.joystick(this.mySprite, this.myZone, "joystickB", {
  bounceBack: true, //  On release, mySprite now bounces back to original position.
});
```

You can even use mutiple joysticks at once, so long as you have the number of pointers set:

```js
const joyZoneA = everything.target("joystickA/joyZone");
const joyStickA = everything.target("joystickA/joyBtn");

const joyZoneB = everything.target("joystickB/joyZone");
const joyStickB = everything.target("joystickB/joyBtn");

this.input.addPointer(2);

this.P2P.use.joystick(joyStickA, joyZoneA, "joystickA", { bounceBack: true });
this.P2P.use.joystick(joyStickB, joyZoneB, "joystickB", { bounceBack: true });

```

Joystick fires events that you can use elsewhere in your project. You can parse the returned values using the keys.

```js
this.events.on("joystickStart", (values) => {
  console.log(values); // { reference to joystick }
  
});
this.events.on("joystickActive", (values) => {
  console.log(values); // { normalized values of movement }
});

this.events.on("joystickRelease", (values) => {
  console.log(values); // { reference to joystick }
});
```

In all cases, the values object has the same structure :

```js
    values: {
      joystickA: { // joystick key
        isActive: false // is active or not
        position: {x: 100, y: 30 } // new x/y of sprite
        change: {x: 30, y: -3 } // shift from original position
        normalized: {x: .3, y: -.6 } // normalized shift from original position
        }
      },
    }
```

### joystick.control()

Joystick comes with some preset control options, which you can use just by chaining the `control` keyword on to the end


```js
this.P2P.use
  .joystick(joyStickA, joyZoneA, "joystickA",
  { bounceBack: true })
  .control( spriteToControl , { // options object
    // speed = standard set position at a particular rate (use maxSpeed option)
    // velocity = apply velocity to a physics object (use force option)
    // until = move sprite a specific number of pixels (use pixels and repeatRate options)
    // tracked = 1-to-1 tracking of joystick with an optional multiplier (use multiplier option )
    type: "speed" | "velocity" | "unit" | "tracked", 
    force : 2, // force multiplier if using "velocity" option
    multiplier : 1.3, // position multiplier if using "tracked" option
    maxSpeed: 300, // speed if using "speed" option
    pixels: 100,// pixels moved  per repeat if using "unit" option.
    repeatRate: 300 // ms between repetitions if using "unit" option.
    directionLock: 4 | 8 | false // 4 = lock to x/y, 8 = x/y + diagonal, false = no direction lock )
});
```

## Gotchas

### Depth & placing your own items.

Because the plugin is maintaining layer order with setDepth() it is very likely that new items will be hidden behind something. When placing something of your own, make sure you set its depth to something higher than the number of layers you're bringing in from the PSD.


## Development

Want to make develop the plugin locally?  Run : `npm run watch` in this folder to build plugin on save.

To link plugin to your project locally, run `npm link` in this folder, and then `npm link psd-to-phaser` in the project you'd like to use it in.

(To reset, just run the same commands with `unlink`.)

## Credits / Authorship

The first and second versions of this project (you're looking at something like version 3.5) were almost entirely generated by Claude Opus over the first couple weeks of July 2024. I take credit as API designer, architect and chief copy-and-paster, but apart from some very light debugging I only guided the bot.

This means that while the conceptual bones are pretty solid, the files themselves are neither [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) nor terribly well optimized.   It's not _as_ hairy a mess as the first couple versions, and a lot of time during version 2 was spent guiding Claude to make better choices, but ... you have been warned: this is a proof of concept that works well, but beyond that I make no promises.

## License

Use it however you want, just don't sell it as your own work. I hope you find this idea to be as much fun as I do.
