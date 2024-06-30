# PSD to JSON Generate

This tool processes specially structured Photoshop (PSD) files, outputting individual image files, x/y points, bounded zones and tilesets, along with a JSON blob that describes it all. There's even an additional PNG optimization step if you're the sort of person who'd be in to that. 

## To Do (Before publish)

- [ ] Generate animations.
- [ ] Generate spritesheet.
- [ ] Generate atlas.

## Installation

Ensure you have the following Python libraries installed:

- [psd-tools](https://github.com/psd-tools/psd-tools)
- [Pillow (PIL)](https://pillow.readthedocs.io/en/stable/)

You can install them using pip:

```
pip install psd-tools Pillow
```

For the optional PNG optimization, you'll need to install:

- [OptiPNG](https://optipng.sourceforge.net)
- [pngquant](https://pngquant.org) 

These can typically be installed using a package manager (e.g., apt, brew).

## Setup

1. Set up your PSD files. (See guide below.)
2. Dial in your specific input/output & settings in `generator/config.json`. (See guide below.)
3. Run the main script:
   ```
   python generator/main.py
   ```
4. Profit.


## Using config.json

The `config.json` file controls the behavior of the script. Here's an example structure with explanations:

```json
{
  "psd_dir": "./psds",
  "output_dir": "./output",
  "slice_size": 512,
  "scaled": [256, 128],
  "optimizePNGs": {
    "sprites": true,
    "tiles": false,
    "renders": false
  }
}
```

- `psd_dir`: Directory containing your PSD files
- `output_dir`: Directory where generated files will be saved
- `slice_size`: Size of tile slices in pixels
- `scaled`: Additional sizes for scaled versions of tiles
- `optimizePNGs`: Control which types of PNGs to optimize

## Setting Up Your PSD

Inside your PSD, any content you want to be output should be placed in one of the following layer groups: 

- `points`
- `zones`
- `sprites`
- `tiles`

### Points
Each layer in this group will be represented in the JSON as an XY point. The point will register at the _center_ of the layer content.

### Zones
Each layer in this group will be represented as a series of points that bound an area. For vector shapes, the bounding box as well as the points of a path will be recorded. For raster layers only the bounding box will be recorded.

### Sprites
Each layer in this group will be output as a PNG. It is possible to nest sprite layer groups. Nested groups will just appear nested in the JSON output.

### Tiles
Groups inside the "tiles" group will be output as a single JPG or PNG (more on that in a moment) and then diced up according to your `tile_slice_size`.  You can also pass in an array of pixel-sizes in to `tile_scaled_versions` (if you'd like to support zooming, for example) which will generate versions of each tile at that size.

If you would like to output a set of transparent PNG tiles, add a "transparent" attribute after the pipe like so :

```
layerName | transparent 
```

## Layer names and attributes

Sprites, points, and zones support attributes.  You can add attributes to a group or layer by placing a pipe ("|") after the name of the layer, followed by a comma-separated list of attributes, like so:

```
layername|attribute1:value1,attribute2:value2
```

For example, if you have a layer in the "points" group with the following name :

```
enemy_spawn|type:goblin,level:5, private: true, style: "border: '1px solid red'"
```

it should output the following in the "points" array of the final JSON blob :

```json
{
  "name": "enemy_spawn",
  "x": 100,  // position of layer
  "y": 200,  // position of layer
  "attributes": {
    "type": "goblin",
    "level": 5,
    "private": true,
    "style": {
      "border": "1px solid red"
    }
  }
}
```

## Tweaking PNG Compression

PNG compression takes a LONG time. Depending on how fast your machine is, you may want to adjust the default settings. You can change things in 2 ways.

1. Switch on and off compression for different export types.

To do this, just edit the relevant section in the `config.json` file:

```json
  "optimizePNGs": {
    "sprites": false,
    "tiles": false,
    "renders": false
  }
```

2. Modify the amount of compression applied.

There's no setting for this, but you can apply your own settings in `generator/src/optimize_pngs.py` on lines 27 & 28.

```python
subprocess.run(f"pngquant --quality=65-80 --ext .png --force {temp_filepath}", shell=True)
```

Adjust the `--quality=65-80` part to your desired range.

Remember that higher quality settings will result in larger file sizes, while lower quality settings will reduce file size but may affect image quality.


