""" src/types/tiles/tile_processor.py
Processes extracted tile layers into usable tile sets.

This module handles the slicing, scaling, and formatting of extracted
tile layers, creating final tile sets and associated metadata.

Parameters:
  tile_layers (list) = List of extracted tile layer objects
  config (dict) = Configuration options for tile processing

Returns:
  processed_tiles (dict) = Dictionary containing processed tile images and metadata
"""

import os
from PIL import Image
from src.helpers.optimize_pngs import optimize_pngs

def create_tiles(image, output_dir, image_name, slice_size, scaled, transparent, jpgQuality, optimize_config):
    width, height = image.size

    # Calculate the number of tiles in each dimension
    num_tiles_x = (width + slice_size - 1) // slice_size
    num_tiles_y = (height + slice_size - 1) // slice_size

    # Create the tiles directory for the original size
    tiles_dir = os.path.join(output_dir, str(slice_size))
    os.makedirs(tiles_dir, exist_ok=True)

    print(f"Slicing {image_name} image into {slice_size}px tiles...")

    # Slice the image into tiles
    for y in range(num_tiles_y):
        for x in range(num_tiles_x):
            left = x * slice_size
            top = y * slice_size
            right = min(left + slice_size, width)
            bottom = min(top + slice_size, height)

            tile = image.crop((left, top, right, bottom))
            if transparent:
                tile_filename = f"{image_name}_tile_{x}_{y}.png"
                tile.save(os.path.join(tiles_dir, tile_filename), 'PNG')
            else:
                tile_filename = f"{image_name}_tile_{x}_{y}.jpg"
                if tile.mode == 'RGBA':
                    tile = tile.convert('RGB')
                tile.save(os.path.join(tiles_dir, tile_filename), 'JPEG', quality=jpgQuality)

    # Optimize PNGs if transparent
    if transparent:
        optimize_pngs(tiles_dir, optimize_config)

    # Create scaled versions of the tiles
    for size in scaled:
        print(f"Creating scaled version at {size}px ...")
        scaled_dir = os.path.join(output_dir, str(size))
        os.makedirs(scaled_dir, exist_ok=True)

        for y in range(num_tiles_y):
            for x in range(num_tiles_x):
                if transparent:
                    tile_filename = f"{image_name}_tile_{x}_{y}.png"
                else:
                    tile_filename = f"{image_name}_tile_{x}_{y}.jpg"
                tile_path = os.path.join(tiles_dir, tile_filename)
                scaled_tile_path = os.path.join(scaled_dir, tile_filename)

                tile = Image.open(tile_path)
                scaled_tile = tile.resize((size, size), Image.LANCZOS)
                if transparent:
                    scaled_tile.save(scaled_tile_path, 'PNG')
                else:
                    if scaled_tile.mode == 'RGBA':
                        scaled_tile = scaled_tile.convert('RGB')
                    scaled_tile.save(scaled_tile_path, 'JPEG', quality=jpgQuality)

        # Optimize scaled PNGs if transparent
        if transparent:
            optimize_pngs(scaled_dir, optimize_config)

    print(f"Finished processing {image_name}")