""" src/types/sprites/sprite.py
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

class SimpleSprite(BaseSprite):
    def __init__(self, layer, output_dir, config, parent=None):
        super().__init__(layer, output_dir, config, parent)
        self.image = None

    def process(self):
        self.image = self.layer.composite()  # Extract sprite image
        sprite_data = self._generate_base_sprite_data()  # Generate sprite data
        self._save_sprite_image()  # Save sprite image
        return sprite_data

    def _save_sprite_image(self):
        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)
        self.image.save(self.output_path, 'PNG')