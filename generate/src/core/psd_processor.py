""" src/core/psd_processor.py
Processes PSD files and extracts relevant information.

This module is responsible for opening PSD files, extracting layers,
and delegating the processing of different types (points, sprites, tiles, zones)
to their respective handlers.

Parameters:
  config (dict) = Configuration dictionary containing processing options

Returns:
  processed_data (dict) = Dictionary containing all extracted and processed information
"""

import os
import logging
from psd_tools import PSDImage
from src.types.sprites.base_sprite import process_sprites
from src.types.tiles.tile_extractor import extract_tiles
from src.types.points import process_points
from src.types.zones import process_zones

import os
from psd_tools import PSDImage
from src.types.sprites.base_sprite import process_sprites

class PSDProcessor:
    def __init__(self, config):
        self.config = config
        self.output_dir = config['output_dir']

    def process_all_psds(self):
        processed_data = {}
        for psd_file in self.config['psd_files']:
            psd = PSDImage.open(psd_file)
            psd_name = os.path.splitext(os.path.basename(psd_file))[0]
            psd_output_dir = os.path.join(self.config['output_dir'], psd_name)
            os.makedirs(psd_output_dir, exist_ok=True)
            processed_data[psd_name] = self.process_psd(psd, psd_file, psd_output_dir)
        return processed_data

    def process_psd(self, psd, psd_file, psd_output_dir):
        psd_data = {
            'name': os.path.splitext(os.path.basename(psd_file))[0],
            'width': psd.width,
            'height': psd.height,
        }

        for layer in psd:
            layer_name_lower = layer.name.lower()
            if layer_name_lower == 'sprites':
                psd_data['sprites'] = process_sprites(layer, psd_output_dir, self.config)
            elif layer_name_lower == 'tiles':
                psd_data['tiles'] = extract_tiles(layer, psd_output_dir, self.config)
            elif layer_name_lower == 'points':
                psd_data['points'] = process_points(layer, self.config)
            elif layer_name_lower == 'zones':
                psd_data['zones'] = process_zones(layer, self.config)

        return psd_data
    
    def process_group(self, group, data, psd_output_dir):
        for layer in group:
            logging.debug(f"Processing layer: {layer.name}")
            if layer.name.lower() == 'points':
                data['points'] = process_points(layer, self.config)
            elif layer.name.lower() == 'zones':
                data['zones'] = process_zones(layer, self.config)
            elif layer.name.lower() == 'tiles':
                optimize_config = {
                    'pngQualityRange': self.config.get('pngQualityRange', {'low': 45, 'high': 65}),
                    'forceAllTiles': self.config.get('forceAllTiles', True)
                }
                data['tiles'] = extract_tiles(layer, 
                                              psd_output_dir, 
                                              self.config['tile_slice_size'], 
                                              self.config['tile_scaled_versions'], 
                                              group,
                                              self.config.get('jpgQuality', 85),
                                              optimize_config)
            elif layer.is_group():
                name_type_dict, _ = parse_attributes(layer.name)
                layer_name = name_type_dict.get('name', layer.name)
                data[layer_name] = {}
                if 'type' in name_type_dict:
                    data[layer_name]['type'] = name_type_dict['type']
                self.process_group(layer, data[layer_name], psd_output_dir)
            else:
                self.process_layer(layer, data)

    def process_layer(self, layer, data):
        layer_name_lower = layer.name.lower()
        if layer_name_lower == 'sprites':
            data['sprites'] = process_sprites(layer, self.output_dir, self.config)
        # We don't need to handle 'zones' here anymore as it's handled in process_group
        
    def process_sprites_group(self, sprites_group):
        sprites_data = []
        for layer in sprites_group:
            sprite_data = process_sprite(layer, self.output_dir, self.config)
            sprites_data.append(sprite_data)
        return sprites_data