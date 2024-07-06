""" src/types/sprites/atlas.py
Creates texture atlases from groups of sprite layers.

This module processes a group of sprite layers, packing them efficiently
into a single texture atlas and generating the necessary metadata.

Parameters:
  layer_group (PSDLayerGroup) = Group of PSD layers to be packed into an atlas

Returns:
  atlas_data (dict) = Dictionary containing the atlas image and placement metadata
"""