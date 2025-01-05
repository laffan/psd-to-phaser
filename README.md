# PSD to Phaser

### ✨ Automatically generate assets from a .psd file and parse them in Phaser. 👾

This pair of tools, inspired by [Tiled](https://www.mapeditor.org/), uses a .psd file to [generate](#1-generator) optimized assets and a JSON manifest. This manifest can then be used by anything that parses JSON, but is particularly well suited to the [custom Phaser plugin](#2-plugin), which re-compiles the PSD using a single line of code. 

A little more on each one of the tools:

### 1. Generator

Using a simple [layer-naming system](/generator/README.md#layer-naming), the generator uses  [psd_tools](https://pypi.org/project/psd-tools/) and [Pillow](https://pypi.org/project/pillow/) to turn your PSD in to a series of optimized assets, along with a sensibly formatted JSON manifest. It's smart enough to output sprites, sprite sheets, atlases, tiles and even animations! (As a standalone tool, this could be useful to just about anyone who uses psds to create assets, regardless of where those assets are headed.)

Learn more in the [📄 Generator README](./generator/README.md).

### 2. Plugin

The PSD-to-Phaser plugin parses the JSON manifest created by the generator and provides a series of helper functions to display, target and manipulate the layers of your PSD in Phaser. It also has some nifty extras like [lazyLoading](/plugin/README.md#lazyload) and a [build-your-own-joystick](/plugin/README.md#joystick-sprite-zone-key) preset.

Learn more in the [📄 Plugin README](./plugin/README.md).

### 3. Demos

The demos give a very high-level look at what is possible with this tool.  At the moment, there are two :

1. [Introduction](/demos/1_introduction/) - The absolute bare-bones to get you up and running.

2. [Platformer](/demos/2_platformer/) - A simple platformer that you can use as a template for your own projects. (Could be a nearly no-code way to make a game with just Procreate.)

I'll be adding to this list as I use the tool more myself.


## Credits / Authorship

The first and second versions of this project (you're looking at something like version 3.5) were almost entirely generated by Claude Opus over the first couple weeks of July 2024. I take credit as API designer, architect and chief copy-and-paster, but apart from some very light debugging I only guided the bot.

This means that while the conceptual bones are pretty solid, the files themselves are neither [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) nor terribly well optimized.  What you see now has been heavily edited, but I have not done a full rewrite.  It's not _as_ hairy a mess as the first couple versions, and a lot of time during version 2 was spent guiding Claude to make better choices, but ... you have been warned: this is a proof of concept that works well, but beyond that I make no promises.

## License

Use it however you want, just don't sell it as your own work. I hope you find this idea to be as much fun as I do.
