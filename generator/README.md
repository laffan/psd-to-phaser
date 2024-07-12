# PSD to JSON Generator

This tool processes specially structured Photoshop (PSD) files, outputting individual image files, x/y points, bounded zones and tilesets, along with a JSON blob that describes it all. There's even an additional PNG optimization step if you're the sort of person who'd be in to that. 

## Installation

Ensure you have the following Python libraries installed:

- [psd-tools](https://github.com/psd-tools/psd-tools)
- [Pillow (PIL)](https://pillow.readthedocs.io/en/stable/)
- [pypng](https://pypi.org/project/pypng/)

You can install them using pip:

```bash
pip install psd-tools Pillow pypng
```

For the optional PNG optimization, you'll need to install:

- [pngquant](https://pngquant.org) 

Can typically be installed using a package manager (e.g., apt, brew).

## Configuration



### Using config.json

The `config.json` file controls the behavior of the script. Here's an example structure with explanations:

```json
{
  // output_dir : Where the generated files go.
  "output_dir": "assets", 
  // psd_files : An array of psd files to be processed each time you run the script.
  "psd_files": [ 
    "../demos/psds/sensible.psd",
    "../demos/psds/simple.psd"
  ],
  // tile_slice_size : For layers in the "tiles" group, how big should the slices be?
  "tile_slice_size": 500, 

  // tile_scaled_versions : Resize tiles to any number of sizes.
  "tile_scaled_versions": [250], 

  // captureLayerProps : Optionally capture certain layer properties.
  "captureLayerProps": {  
  // alpha : capture the alpha value of the layer.
  // NOTE: This affects image output
  //         a 'true' value will output a 100% opaque layer 
  //         a 'false' value  will output the translucent png.
    "alpha": false,  
    // blend_mode : capture blend mode of each layer 
    // NOTE : Ignores "NORMAL" or "PASSTHROUGH"
    "blend_mode": false 
  },

  // generateOnSave : Runs generator when any one of the PSDs is saved.
  "generateOnSave": true, 

  // pngQualityRange : Control PNG compression. (All PNGs are optimzied)
  "pngQualityRange": {  
    "low": 45,  // lowest possible quality.
    "high": 65  // highest possible quality
  },
  // jpgQuality : Quality of compressed JPG.
  "jpgQuality": 80 
}
```

### Running the script

Once you have everything as you like it, just run

   ```bash
   python generator/main.py # For mac users it might be python3
   ```


## Setting Up Your PSD

Inside your PSD, any content you want to be output should be placed in one of the following layer groups: 

- `points`
- `zones`
- `sprites`
- `tiles`

**Note:** 

- Content outside of these groups will be ignored.
- With the exception of animations, **hidden layers will not show up in export.**


### Basic Export Types

#### Points
Each layer in this group will be represented in the JSON as an XY point. The point will register at the _center_ of the layer content.

#### Zones
Each layer in this group will be represented as a series of points that bound an area. For vector shapes, the bounding box as well as the points of a path will be recorded. For raster layers only the bounding box will be recorded.

#### Sprites
Each layer in this group will be output as a PNG.  Sprites can have [special types](#types).

#### Tiles
Groups inside the "tiles" group will be output as a single JPG or PNG (more on that in a moment) and then diced up according to your `tile_slice_size`.  You can also pass in an array of pixel-sizes in to `tile_scaled_versions` (if you'd like to support zooming, for example) which will generate versions of each tile at that size.

If you would like to output a set of transparent PNG tiles, set the group type to  "transparent" like so :

```
layerName | transparent | 
```

### Nesting

With the exception of tiles, all groups support nesting.  Nested items of all export types will be represented as such in the JSON. Nested sprites will export their images in folders that reflect the nesting structure. 


### Layer names, types and attributes

The generator derives a lot of information from layer names. When the PSD is being parsed, the text of each layer name is split up using the "|" character.  The layer name is used to name the saved asset.

```js

// No pipe : No attributes or types. 
assetName 

// Single pipe : Only attributes are being passed in.
assetName | attributes 

// Double pipe : Attributes and types are being passed in.
assetName | type | attributes

// NOTE : For types without attributes, don't forget the second pipe.
assetName | type |

```

### Types 
Types are simple strings that tell the generator how to process a layerGroup. In the resulting JSON, they are also saved as an attribute in that layer's object.   

#### Sprite Types

**merge** : Treat the group as a single sprite. Child layer files are not saved and child attributes will be lost. 

`groupName | merge |`

**animation** : Converts the layers in the group in to an animation spritesheet. No cropping occours so the elments of the animation are correctly placed relative to one another. The layers must all have integers for names (ie. 001, 002, 003).  Child layer files are not saved and child attributes lost. 

`groupName | animation |`

**atlas** : Converts group in to a packed texture atlas.  Child layer files are not saved, but the attributes and positions of children will be found in the "placement" array in the JSON.

`groupName | atlas |`

**spritesheet** : Convert group in to a simple spritesheet. Child layers are cropped and centered in a frame that is determined by the largest in the group. Child layer files are not saved, but the attributes and positions of children will be found in the "placement" array in the JSON. 

`groupName | spritesheet |`


#### Tile Types

**transparent** : Tiles are by default JPGS, but "transparent" tile groups will be exported as PNGs. 

`groupName | transparent |`


### Attributes 
All layers regardless of type support attributes. They are passed in as a comma-separated list, like so:

```
layername | attribute1:value1,attribute2:value2
```

The attribute name cannot include spaces or special characters.  The attribute value can be a string, integers, booleans or arrays.  Strings passed in without a colon are understood to be true booleans.

For example, if you have a layer in the "points" group with the following name :

```
enemy_spawn | level:5, isPrivate, style: "fancy", targets:["pandas", "dogs", "Bob"]
```

it should output the following in the "points" array of the final JSON blob :

```json
{
  "name": "enemy_spawn",
  "x": 100,  // position of layer always stored
  "y": 200,  // position of layer always stored
  "level": 5,
  "isPrivate": true,
  "style": "fancy",
  "targets": [
    "pandas",
    "dogs",
    "Bob"
  ],}
```

## TODOs

### Finish

### Bugs
- [ ] `captureLayerProps/alpha` doesn't work with atlas items.

## New Features


## Credits

Texture packing thanks to : https://github.com/Ezphares/TextureAtlas


