# Generator

The generator processes Photoshop (PSD) files in to optimized assets and an accompanying "data.json" file that describes how the assets appeared in the original document. 

## Installation

Ensure you have the following Python libraries installed:

- [psd-tools](https://github.com/psd-tools/psd-tools)
- [Pillow (PIL)](https://pillow.readthedocs.io/en/stable/)
- [pypng](https://pypi.org/project/pypng/)

You can install them using the following pip command:

```bash
pip install psd-tools Pillow pypng
```

For the PNG optimization, you'll also need to install:

- [pngquant](https://pngquant.org) 

(Can typically be installed using a package manager like brew).

## Configuration

The `config.json` file controls the behavior of the script. Here's an example structure with explanations:

```json
{
  // output_dir : Where the generated files go.
  "output_dir": "../demos/1_introduction/public/assets/", 
  // psd_files : An array of psd files to be processed each time you run the script.
  "psd_files": [ 
    "../demos/1_introduction.psd",
  ],
  // tile_slice_size : For layers in the "tiles" group, how big should the slices be?
  "tile_slice_size": 500, 

  // tile_scaled_versions : Resize tiles to any number of sizes.
  "tile_scaled_versions": [250], 

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
   # Might be python3, depending on your setup
   python main.py 
   ```

#### Generate on save

If you have `generateOnSave` set to true, the script will stay active, and saving any PSD in your `psd_files` array will trigger the script. Ideally you should have the same thing turned on for frontend development (see [demos](./../demos/platformer/), so saved changes immediately show up in the browser.)

## Layer Naming

This entire tool revolves around layer naming. Layer names are used to determine how you want each layer to be processed. Layer names contain anywhere from two to four pieces of information. Each piece is divided with a pipe ("|") character, like so:

`  category  |  name  |  type  |  attributes  `

The number of pipes will determine how the layer name is parsed : 

- 0 Pipes : This layer or group should be ignored.
- 1 Pipe : This layer contains a category and a name.
- 2 Pipes : This layer contains a category, a name and attributes.
- 3 Pipes : This layer contains a category, a name, a type and (potentially) attributes.

Let's go through each piece of information.

### category (required)

Categories tell the processor how to treat the layer. There are five categories, which you pass in using the first character: 

- **[G]roup :**  Groups are are just the category you give to groups that you'd like to be read as such.  (If you wanted them to be read as a flattened image, you'd use S, see below.) Groups can be nested to any depth  and be given [attributes](#attributes). (Even the magic ones, like [lazyLoad](../plugin/README.md#lazyload).)

- **[P]oints :**  Point layers will be represented in the JSON as an XY point. Because you need to see them somehow, you'll probably want to have some visual representation of the point in your PSD, but take note : **the point will register at the _center_ of the layer content**. This being the case, I've found that Xs make good point markers.

- **[Z]ones -** Zone layers will be represented as a series of points that bound an area. For vector shapes, the bounding box as well as the points of a path will be recorded. For raster layers only the bounding box will be recorded. For example, a vector layer named `Z | Boundary` would output as a series of points with the name "Boundary".

- **[S]prites -** Sprites are output as a PNG.  Sprites that are partially off the canvas will be output in their entirity. Sprites can either be image layers or layer groups. In the latter case, they'll just be flattened and treated as image layers.  There's a lot to say about sprites. The default behavior is to just output the image, but sprites can also have [special types](#sprite-types). 

- **[T]iles -** Tiles can be either groups or individual layers and will also output an image, but but tiles go a step further: they are diced up according to the `tile_slice_size` you set in config.json.  You can also pass in an array of pixel-sizes in to `tile_scaled_versions` (if you'd like to support zooming, for example) which will generate versions of each tile at that size. Tiles support the [jpg type](#tile-types) and are generally designed to be lazyloaded, but that's up to you.

### name (required)

The layer name can be whatever you want it to be, but be warned : **layer names are used to create files, so if you have two layers with the same name they will only produce one file.** This can actually be seen as a feature - it permits you to have multiple instances of the same sprite with different positions and attributes, but it could also confuse some folks. I also recommend avoiding special characters in layer names. Using camel case or underscores will make your life easier later on. 

So, with those two requirements, here are a some valid layer names.

```js
S | mySprite
P | myPoint
Z | myZone
G | myGroup
T | myTiles
```

But that's too easy ... let's complicate things a bit.

### type (optional)

Types are simple strings that tell the generator how to process a layerGroup. In the resulting JSON, they are also saved as an attribute in that layer's object.   See the available types in the [types](#types) section. 

### attributes (optional)

For any layer you can pass in a list of custom attributes that are saved to the JSON alongside the rest of the information. See how they work in the [attributes](#attributes) section.


## Types 

Sprites and tile categories support different types. Here's a quick breakdown of each. 

### Sprite Types

#### animation
 Converts the layers in the group in to an animation spritesheet. No cropping occours so the elments of the animation are correctly placed relative to one another. The layers must all have integers for names (ie. 001, 002, 003).  Child layer files are not saved and child attributes lost. This is how you'd name an animation:

`S | groupName | animation |`

#### atlas
 Converts group in to a packed texture atlas.  Child layer files are not saved, but the attributes and positions of children will be found in the "placement" array in the JSON.

`S | groupName | atlas |`

#### spritesheet
Convert group in to a simple spritesheet. Child layers are cropped and centered in a frame that is determined by the largest in the group. Child layer files are not saved, but the attributes and positions of children will be found in the "placement" array in the JSON. 

`S | groupName | spritesheet |`

**Note : Because the generate spritesheet is making frames of equal size, spritesheets composed of different sized sprites will shift when placed in Phaser.  If placement position is important in a case like this, use atlas instead.**

### Tile Types
At the moment, tiles only support one type.

#### jpg
Tiles are by default PNGs, but "jpg" tile groups will be exported as JPGs. 

`S | groupName | jpg |`


## Attributes 
All layers regardless of type support attributes. They are passed in as a comma-separated list, like so:

`S | layername | attribute1:value1, attribute2:value2`

The attribute name cannot include spaces or special characters.  The attribute value can be a string, integers, booleans or arrays.  

Strings passed in without a colon are understood to be true booleans.

For example, if you have a layer with the following name :


`P | enemy_spawn | level:5, isPrivate, style: "fancy", targets:["pandas", "dogs", "Bob"]`

it should output the following JSON :

```json
{
  "name": "enemy_spawn",
  "category" : "point",
  "x": 100,  // position of layer always stored
  "y": 200,  // ditto
  "level": 5,
  "isPrivate": true,
  "style": "fancy",
  "targets": [
    "pandas",
    "dogs",
    "Bob"
  ],}
```


## Credits

Texture packing thanks to : https://github.com/Ezphares/TextureAtlas


