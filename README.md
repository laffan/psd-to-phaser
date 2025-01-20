# PSD to Phaser

### ✨ Automatically generate assets from a psd file and parse them in Phaser. 👾

psd-to-phaser is a pair of tools that work together to reconstruct a PSD inside Phaser. First is [the generator](#1-generator), which outputs the layers as individually optimized files.  The generator then creates a JSON manifest that is read by the second tool, [a Phaser plugin](#2-plugin). The plugin reads the JSON, loads the files and then does the work of rebuilding everything inside Phaser. 

#### Also ... 
- 🧑‍🎨 Not an Adobe user? That's ok! You can work with PSDs in Procreate, krita, gimp, Affinity Photo and even ([with a little help](https://github.com/Tsukina-7mochi/aseprite-scripts/blob/master/psd/readme.md)) Aseprite!
- 🧪 Everything has been tested on MacOS and Windows, and should work just fine for Linux users as well.
- 📜 The manifest is just a series of paths and positions, so you might find the generator useful even if you're not using Phaser.

A little more on the individual tools :

### 1. Generator

Using a simple [layer-naming system](/generator/README.md#layer-naming), the generator uses  [psd_tools](https://pypi.org/project/psd-tools/) and [Pillow](https://pypi.org/project/pillow/) to crawl the layer structure and turn your PSD in to a series of optimized assets. It's smart enough to output sprites, sprite sheets, atlases, tiles and even animations! 

**👉 Learn more in the [Generator README](./generator/README.md).**

### 2. Plugin

The PSD-to-Phaser plugin parses the JSON manifest created by the generator and provides a series of helper functions to display, target and manipulate the layers of your PSD in Phaser. It also has some nifty extras like [lazyLoading](/plugin/README.md#lazyload) and a a few presets that I thought might be useful ([parallax](/plugin/README.md#parallax) and [build-your-own-joystick](/plugin/README.md#joystick-sprite-zone-key) being my favorites.)

**👉  Learn more in the [Plugin README](./plugin/README.md).**

### Example

The [example project](/example/README.md) is about as bare-bones as it gets. Demonstrates basic loading and particles.  I'll be adding more examples soon. 

[🖥️ Click here to see it running on codesandbox.io](https://codesandbox.io/p/github/laffan/psd-to-phaser-example-1/).



## Credits / Authorship

The first and second versions of this project (you're looking at something like version 3.5) were almost entirely generated by Claude Opus over the first couple weeks of July 2024. I take credit as API designer, architect and chief copy-and-paster, but apart from some very light debugging I only guided the bot.

This means that while the conceptual bones are pretty solid, the files themselves are neither [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) nor terribly well optimized.  What you see now has been heavily edited, but I have not done a full rewrite.  It's not _as_ hairy a mess as the first couple versions, and a lot of time during version 2 was spent guiding Claude to make better choices, but ... you have been warned: this is a proof of concept that works well, but beyond that I make no promises.

## License

Use it however you want, just don't sell it as your own work. I hope you find this idea to be as much fun as I do.
