""" src/types/tiles/tile_extractor.py
Extracts tile layers from PSD files.

This module handles the identification and extraction of tile layers
from PSD files, preparing them for further processing.

Parameters:
  psd (PSDImage) = The PSD file object to extract tiles from
  config (dict) = Configuration options for tile extraction

Returns:
  extracted_tiles (list) = List of extracted tile layer objects
"""

import os
from PIL import Image
from src.helpers.parsers import parse_attributes
from src.types.tiles.tile_processor import create_tiles

Image.MAX_IMAGE_PIXELS = None  # Disable the DecompressionBombWarning

def extract_tiles(tiles_group, psd_output_dir, config):
    print("Processing tiles layer group...")

    tile_slice_size = config.get('tile_slice_size', 512)
    tile_scaled_versions = config.get('tile_scaled_versions', [])
    jpgQuality = config.get('jpgQuality', 85)
    optimize_config = config.get('optimizePNGs', {})

    # Calculate number of rows and columns based on the PSD size
    columns = (tiles_group.width + tile_slice_size - 1) // tile_slice_size
    rows = (tiles_group.height + tile_slice_size - 1) // tile_slice_size

    tiles_data = {
        "tile_slice_size": tile_slice_size,
        "tile_scaled_versions": tile_scaled_versions,
        "columns": columns,
        "rows": rows,
        "layers": []
    }

    tiles_output_dir = os.path.join(psd_output_dir, 'tiles')
    os.makedirs(tiles_output_dir, exist_ok=True)

    for layer in tiles_group:
        if layer.is_group():
            print(f"Composing {layer.name} layer group...")

            # Parse the layer name and attributes
            name_type_dict, attributes = parse_attributes(layer.name)

            # Compose the layer group
            tile_image = layer.composite()

            # Crop the tile image to the size of the PSD canvas
            print(f"Cropping {name_type_dict['name']} layer group...")
            tile_image = tile_image.crop((0 - layer.left, 0 - layer.top, tiles_group.width - layer.left, tiles_group.height - layer.top))

            # Determine if the layer should be exported as transparent based on the type
            is_transparent = name_type_dict.get("type") == "transparent"

            # Generate tiles for the exported image
            create_tiles(tile_image,
                         tiles_output_dir,
                         name_type_dict["name"],
                         tile_slice_size,
                         tile_scaled_versions,
                         is_transparent,
                         jpgQuality,
                         optimize_config)

            # Store the tile information
            tile_info = {
                **name_type_dict,
                **attributes
            }
            tiles_data["layers"].append(tile_info)

    return tiles_data