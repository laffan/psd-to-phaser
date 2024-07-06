""" src/types/sprites/base_sprite.py
Defines the base class for all sprite types.

This module provides common functionality and attributes for
different types of sprites (single sprites, animations, atlases, spritesheets).

Parameters:
  layer (PSDLayer) = PSD layer object representing the sprite

Returns:
  BaseSprite object
"""

import os
from src.helpers.parsers import parse_attributes

class BaseSprite:
    def __init__(self, layer, output_dir, config, parent_path=''):
        self.layer = layer
        self.output_dir = output_dir
        self.config = config
        self.name_type_dict, self.attributes = parse_attributes(layer.name)
        self.sprite_type = self.name_type_dict.get('type', 'simple')
        self.parent_path = parent_path
        self.output_path = self._generate_output_path()
        self.layer_order = config.get('current_layer_order', 0)
        config['current_layer_order'] = self.layer_order + 1

    def process(self):
        sprite_data = self._generate_base_sprite_data()
        if self.layer.is_group():
            children = self._process_children()
            if children:
                sprite_data['children'] = children
        return sprite_data

    def _generate_output_path(self):
        sprite_name = self.name_type_dict.get('name', self.layer.name)
        return os.path.join(self.output_dir, 'sprites', self.parent_path, f"{sprite_name}.png")

    def _get_relative_path(self):
        return os.path.relpath(self.output_path, self.output_dir)

    def _generate_base_sprite_data(self):
        return {
            "name": self.name_type_dict.get('name', self.layer.name),
            "type": self.sprite_type,
            "filePath": self._get_relative_path(),
            "x": self.layer.left,
            "y": self.layer.top,
            "width": self.layer.width,
            "height": self.layer.height,
            "layerOrder": self.layer_order,
            **self.attributes
        }

    def _process_children(self):
        children = []
        for child_layer in self.layer:
            child_sprite = BaseSprite.create_sprite(child_layer, self.output_dir, self.config, 
                                                    os.path.join(self.parent_path, self.name_type_dict.get('name', self.layer.name)))
            children.append(child_sprite.process())
        return children

    @staticmethod
    def create_sprite(layer, output_dir, config, parent_path=''):
        name_type_dict, _ = parse_attributes(layer.name)
        sprite_type = name_type_dict.get('type', 'simple')

        # Here we would handle different sprite types (animation, atlas, spritesheet)
        # For now, we'll use BaseSprite for all types
        return BaseSprite(layer, output_dir, config, parent_path)

def process_sprites(sprites_group, output_dir, config):
    sprites_data = []
    for layer in sprites_group:
        sprite = BaseSprite.create_sprite(layer, output_dir, config)
        sprites_data.append(sprite.process())
    return sprites_data