""" src/types/sprites/atlas.py
Creates texture atlases from groups of sprite layers.

This module processes a group of sprite layers, packing them efficiently
into a single texture atlas and generating the necessary metadata.

Parameters:
  layer_group (PSDLayerGroup) = Group of PSD layers to be packed into an atlas

Returns:
  atlas_data (dict) = Dictionary containing the atlas image and placement metadata
"""

import os
from PIL import Image
from src.types.sprites.base_sprite import BaseSprite
from src.helpers.pack_textures import pack_textures
from src.helpers.optimize_pngs import optimize_pngs
from src.helpers.parsers import parse_attributes

class AtlasSprite(BaseSprite):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.frames = []
        self.frame_dict = {}
        self.layer_order_counter = 0

    def process(self):
        sprite_data = self._generate_base_sprite_data()
        self._collect_frames()
        
        # Create atlas
        atlas_image, atlas_data = self._create_atlas()
        
        # Save atlas image
        self._save_image(atlas_image)
        
        # Update sprite data
        sprite_data.update({
            "atlas_image": self._get_relative_path(),
            "atlas_data": atlas_data
        })
        
        return sprite_data

    def _collect_frames(self):
        for child in self.layer:
            name, attributes = parse_attributes(child.name)
            frame = child.composite()
            
            frame_name = name.get('name', child.name)
            if frame_name not in self.frame_dict:
                self.frame_dict[frame_name] = {
                    'image': frame,
                    'instances': []
                }
                self.frames.append((frame_name, frame, child.left, child.top))
            
            instance_name = f"{frame_name}_{len(self.frame_dict[frame_name]['instances'])}"
            
            self.frame_dict[frame_name]['instances'].append({
                'attributes': attributes,
                'left': child.left,
                'top': child.top,
                'layerOrder': self.layer_order_counter,
                'instanceName': instance_name
            })
            self.layer_order_counter += 1

    def _create_atlas(self):
        atlas_image, atlas_data = pack_textures(self.frames, self.layer.left, self.layer.top)
        
        # Update placement data with all instances
        new_placement = []
        for frame_data in atlas_data['frames']:
            frame_name = frame_data['name']
            for instance in self.frame_dict[frame_name]['instances']:
                placement = {
                    'frame': frame_name,
                    'layerOrder': instance['layerOrder'],
                    'instanceName': instance['instanceName'],
                    'relative': {
                        'x': instance['left'] - self.layer.left,
                        'y': instance['top'] - self.layer.top
                    },
                    'absolute': {
                        'x': instance['left'],
                        'y': instance['top']
                    },
                    **instance['attributes']
                }
                new_placement.append(placement)
        
        atlas_data['placement'] = new_placement
        return atlas_image, atlas_data

    def _save_image(self, image):
        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)
        image.save(self.output_path, 'PNG')
        optimize_pngs(self.output_path, self.config.get('optimizePNGs', {}))

    def _process_children(self):
        # Override this method to do nothing for atlas sprites
        return None