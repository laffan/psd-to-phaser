# PSD to JSON Phaser Plugin

PsdToJSON's phaser plugin is a bunch of convenience functions to get PSD to JSON up and running in your phaser project more quickly.

## ToDo

- [x] placeAll()
- [x] Access loaded/nested content. (Move stuff, add physics, setPos, etc)
- [👉] Spritesheets
- [ ] Atlas
- [ ] Animation
- [ ] Root x/y (+ placing multiple psds in a single scene)
- [ ] Instance (loop back around to generate first)
- [ ]

## Usage Notes

### Initialization

You can initialize the plugin via when creating the game's configuration object, like so :

```js
new Phaser.Game({
  // ...
  plugins: {
    global: [
      {
        key: "PsdToJSONPlugin",
        plugin: PsdToJSONPlugin,
        start: true,
        mapping: "P2J", // all examples below assume you're mapping to P2J
        data: { debug: true },
      },
    ],
  },
  // ...
});
```

Note that the optional debug mode is on, which gives you simple visualizations of where all objects are being placed. This can be turned on individually for each item as well.

### Loading

Load in PsdToJSON data by passing in the containing folder. Any assets in the JSON that are not lazyLoad will automatically start loading.

```js
// Load the JSON
this.P2J.load(this, "simple_psd", "assets/simple");

// Listen for asset loading progress
this.events.on("psdAssetsLoadProgress", (value) => {
  this.p2jProgress = value;
  this.updateProgress();
});

// Listen for asset loading completion
this.events.once("psdAssetsLoadComplete", this.onP2JLoadComplete, this);
```

### Placement

All types have place() and placeAll() methods that work with nesting. Nesting uses forward slashes to dig in to the structure, just like a path.

```js
this.myTiles = this.P2J.tiles.placeAll(this, "simple_psd");
this.myPoints = this.P2J.points.placeAll(this, "simple_psd");
this.myZones = this.P2J.zones.placeAll(this, "simple_psd");
// this.mySprites = this.P2J.sprites.placeAll(this, "simple_psd");

// Place group
this.mySprites = this.P2J.sprites.place(
  this,
  "nestedSprites/moreNested",
  "simple_psd"
);
```

To get a debug box around the element being placed, use the options object :

```js
this.P2J.sprites.placeAll(this, "simple_psd", { debug: true });
```

### Retreival

All types have a get() method, which you can use to retreive any object with the same path structure.

```js
// Load all sprites
this.mySprites = this.P2J.sprites.placeAll(this, "simple_psd");

// Retreive an individual sprite
this.nest = this.P2J.sprites.get(
  "simple_psd",
  "nestedSprites/moreNested/aNestedSprite"
);
```

### Sprites / Images

Sprites are placed as Phaser Sprites by default, but _can_ be placed as Images via the options object.

```js
// Create Image instances for all sprites.
this.P2J.sprites.placeAll(this, "simple_psd", { useImage: true });

// For individual sprites
this.P2J.sprites.place(
  this,
  "nestedSprites/moreNested/aNestedSprite",
  "simple_psd",
  { useImage: true }
);
```

### Animations

PsdToJSON generates an animation spritesheet for any layer that has a type of "animation". This is all handled automatically, so if you've done your layer naming properly, you should just see an animated sprite when loading the JSON.  Animations are just phaser animations, so all associated functions (play(), pause(), resume() etc) should work as expected. 

You can override the default animation properties at several points.

1. Layer naming : In Photoshop, the attributes of the layer name itself can control animation properties. If you pass valid animation parameters, they will be merged in when instantiating the animation.

```
bounce | animation | frameRate: 5, yoyo: true
```

2. Instantiation : When instantiating the sprite, you can also pass in animation parameters, so the same thing could be acheived like so :

```js
// For individual sprites
this.P2J.sprites.place(this, "nested/bounce", "simple_psd", {
  animationOptions: {
    frameRate: 5,
    yoyo: true,
  },
});
```

3. Using get() : You can always use get() to retreive the sprite and then use updateAnimation():

```js
this.bounce = this.P2J.sprites.get("simple_psd", "nested/bounce");

this.bounce.updateAnimation({
  frameRate: 5,
  yoyo: true,
});
```

## Development

When developing, run : `npm run watch` to build plugin on save.

To link plugin to your project locally, run `npm link` in this folder, and then `npm link psd-to-json-plugin` in the project you'd like to use it in.

(To reset, just run the same commands with `unlink`.)
