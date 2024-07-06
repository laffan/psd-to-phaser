""" src/helpers/texture_packer/atlas.py
Manages the creation and manipulation of texture atlases.

This module handles the process of creating a texture atlas from
multiple images, including the final image generation and metadata.

Parameters:
  packed_rectangles (list) = List of packed Rectangle objects
  image_data (dict) = Dictionary mapping Rectangle objects to their image data

Returns:
  atlas_image (Image) = The final texture atlas image
  atlas_metadata (dict) = Metadata describing the layout of the atlas
"""