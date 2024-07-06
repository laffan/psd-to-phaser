""" src/types/sprites/spritesheet.py
Generates spritesheets from groups of sprite layers.

This module processes a group of sprite layers, arranging them into a
grid-based spritesheet and generating the necessary metadata.

Parameters:
  layer_group (PSDLayerGroup) = Group of PSD layers to be arranged into a spritesheet

Returns:
  spritesheet_data (dict) = Dictionary containing the spritesheet image and frame metadata
"""