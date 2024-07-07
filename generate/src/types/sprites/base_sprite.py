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
from PIL import Image
from src.helpers.parsers import parse_attributes
from src.helpers.optimize_pngs import optimize_pngs

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
            # Remove filePath for layer groups
            if 'filePath' in sprite_data:
                del sprite_data['filePath']
        else:
            self._export_image()
        return sprite_data

    def _generate_output_path(self):
        sprite_name = self.name_type_dict.get('name', self.layer.name)
        return os.path.join(self.output_dir, 'sprites', self.parent_path, f"{sprite_name}.png")

    def _get_relative_path(self):
        return os.path.relpath(self.output_path, self.output_dir)

    def _generate_base_sprite_data(self):
        base_data = {
            "name": self.name_type_dict.get('name', self.layer.name),
            "type": self.sprite_type,
            "x": self.layer.left,
            "y": self.layer.top,
            "width": self.layer.width,
            "height": self.layer.height,
            "layerOrder": self.layer_order,
            **self.attributes
        }
        # Only add filePath if it's not a group
        if not self.layer.is_group():
            base_data["filePath"] = self._get_relative_path()
        return base_data

    def _process_children(self):
        children = []
        for child_layer in self.layer:
            child_sprite = BaseSprite.create_sprite(child_layer, self.output_dir, self.config,
                                                    os.path.join(self.parent_path, self.name_type_dict.get('name', self.layer.name)))
            children.append(child_sprite.process())
        return children

    def _export_image(self):
        # Ensure the output directory exists
        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)

        # Export the layer as an image
        image = self.layer.composite()
        image.save(self.output_path, 'PNG')

        # Optimize the PNG
        optimize_pngs(self.output_path, self.config.get('optimizePNGs', {}))

    @staticmethod
    def create_sprite(layer, output_dir, config, parent_path=''):
        name_type_dict, _ = parse_attributes(layer.name)
        sprite_type = name_type_dict.get('type', 'simple')

        if sprite_type == 'merged':
            from src.types.sprites.merged import MergedSprite
            return MergedSprite(layer, output_dir, config, parent_path)
        elif sprite_type == 'animation':
            from src.types.sprites.animation import AnimationSprite
            return AnimationSprite(layer, output_dir, config, parent_path)
        elif sprite_type == 'atlas':
            from src.types.sprites.atlas import AtlasSprite
            return AtlasSprite(layer, output_dir, config, parent_path)
        elif sprite_type == 'spritesheet':
            from src.types.sprites.spritesheet import SpritesheetSprite
            return SpritesheetSprite(layer, output_dir, config, parent_path)
        else:
            return BaseSprite(layer, output_dir, config, parent_path)


def process_sprites(sprites_group, output_dir, config):
    sprites_data = []
    for layer in sprites_group:
        sprite = BaseSprite.create_sprite(layer, output_dir, config)
        sprites_data.append(sprite.process())
    return sprites_data