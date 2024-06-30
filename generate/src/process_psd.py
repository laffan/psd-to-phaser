import os
import json
import re
from psd_tools import PSDImage
from PIL import Image

from src.extract_sprites import extract_sprites
from src.extract_points import extract_points
from src.extract_tiles import extract_tiles
from src.extract_zones import extract_zones
from src.parsers import *

Image.MAX_IMAGE_PIXELS = None  # Disable the DecompressionBombWarning

def process_psd(psd_path, output_dir, slice_size, scaled, psd_name):
    # Load the PSD file
    print(f"Processing PSD file: {os.path.basename(psd_path)}")
    psd = PSDImage.open(psd_path)

    # Create the output directory specific to the PSD file
    os.makedirs(output_dir, exist_ok=True)
        
    # Create the JSON data structure
    json_data = {
        "filename": os.path.splitext(os.path.basename(psd_path))[0],
        "width": psd.width,
        "height": psd.height,
        "points": [],
        "sprites": [],
        "zones": [],
        "tiles": {}
    }
    
    # Process tiles
    tiles_group = None
    for layer in psd:
        if layer.is_group() and layer.name == 'tiles':
            tiles_group = layer
            break
          
    if tiles_group:
        json_data["tiles"] = extract_tiles(tiles_group, output_dir, slice_size, scaled, psd)
    else:
        print('Layer group "tiles" not found') 

    # Process sprites
    sprites_group = None
    for layer in psd:
        if layer.is_group() and layer.name == 'sprites':
            sprites_group = layer
            break

    if sprites_group:
        json_data["sprites"] = extract_sprites(sprites_group, output_dir)
    else:
        print('Layer group "sprites" not found')

    # Process points
    points_group = None
    for layer in psd:
        if layer.is_group() and layer.name == 'points':
            points_group = layer
            break

    if points_group:
        json_data["points"] = extract_points(points_group)
    else:
        print('Layer group "points" not found')

    # Process zones
    zones_group = None
    for layer in psd:
        if layer.is_group() and layer.name == 'zones':
            zones_group = layer
            break

    if zones_group:
        json_data["zones"] = extract_zones(zones_group)
    else:
        print('Layer group "zones" not found')

    # Save the JSON data to a file
    with open(os.path.join(output_dir, 'data.json'), 'w') as json_file:
        json.dump(json_data, json_file, indent=2)
    print('Exported JSON data to data.json')

    return json_data