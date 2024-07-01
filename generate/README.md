# PSD to JSON Generate

This tool processes specially structured Photoshop (PSD) files, outputting individual image files, x/y points, bounded zones and tilesets, along with a JSON blob that describes it all. There's even an additional PNG optimization step if you're the sort of person who'd be in to that. 

## Installation

Ensure you have the following Python libraries installed:

- [psd-tools](https://github.com/psd-tools/psd-tools)
- [Pillow (PIL)](https://pillow.readthedocs.io/en/stable/)

You can install them using pip:

```bash
pip install psd-tools Pillow
```

For the optional PNG optimization, you'll need to install:

- [pngquant](https://pngquant.org) 

Can typically be installed using a package manager (e.g., apt, brew).

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

If you would like to output a set of transparent PNG tiles, set the group type to  "transparent" like so :

```
layerName | transparent | 
```

## Layer names, types and attributes

When the PSD is being parsed, the text of each layer name is used to both direct the generator (types) and pass information directly in to the JSON (attributes).  They should be formatted like so : 

```js
assetName // no type or attribute

// or

assetName | attributes

// or

assetName | type | attributes
```

If there is one pipe, it will be understood that you only want to provide a list of attributes.  If there are two pipes, then you are setting a type as well. 

### Types 
Types are simple strings that tell the generator how to process the layer. In the resulting JSON, they are also saved as an attributes in that layer's object. 

#### Sprite Groups

If no type is assigned, image layers will just be output as pngs. However, you can use types to direct groups to be output in a particular way.

**merge** : Treat a group as a single image. Child layer files are not saved and child attributes lost. 

`groupName | merge |`

**animation** : Converts the layers in the group in to an animation spritesheet. They are not cropped so position stays relative. The layers must all have integers for names (ie. 001, 002, 003).  Child layer files are not saved and child attributes lost. 

`groupName | animation |`

**atlas** : Converts group in to a (somewhat) packed texture atlas.  Child layer files are not saved and child attributes lost. 

`groupName | atlas |`


**spritesheet** : Convert group in to a simple spritesheet. Images are cropped and centered in a frame that is determined by the largest in the group. Child layer files are not saved and child attributes lost. 

`groupName | spritesheet |`




#### Tile Types

**transparent** : Tiles are by default JPGS, but "transparent" tile groups will be exported as PNGs. 

`groupName | transparent |`


### Attributes 
All layers support attributes. They are passed in as a comma-separated list, like so:

```
layername | attribute1:value1,attribute2:value2
```

For example, if you have a layer in the "points" group with the following name :

```
enemy_spawn | level:5, private: true, style: "border: '1px solid red'"
```

it should output the following in the "points" array of the final JSON blob :

```json
{
  "name": "enemy_spawn",
  "x": 100,  // position of layer
  "y": 200,  // position of layer
  "attributes": {
    "level": 5,
    "private": true,
    "style": {
      "border": "1px solid red"
    }
  }
}
```

This system is not perfect, but should work with strings, ints, bools and arrays

## Tweaking PNG Compression

PNG compression is pretty quick, so you'll see that both sprites and tiles have it on by default in the config.

```json
  "optimizePNGs": {
    "forceAllSprites": true,
    "forceAllTiles": true
  }
```

However if you'd rather not compress everything, you can switch to `false` and pass in a layer attribute - `compress: true` - which will compress just the output of that layer. 