""" src/helpers/texture_packer/packer.py
Implements the core packing algorithm for texture atlases.

This module contains the main logic for arranging multiple images
into a single texture atlas, optimizing for space efficiency.

Parameters:
  images (list) = List of image objects to pack into the atlas

Returns:
  atlas (Image) = The resulting packed texture atlas
  metadata (dict) = Information about the placement of each image in the atlas
"""