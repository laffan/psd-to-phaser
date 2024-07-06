""" src/types/sprites/animation.py
Processes and generates animation data from PSD layers.

This module handles the extraction and compilation of animation frames
from a group of PSD layers, creating a spritesheet and animation metadata.

Parameters:
  layer_group (PSDLayerGroup) = Group of PSD layers representing animation frames

Returns:
  animation_data (dict) = Dictionary containing spritesheet image and animation metadata
"""

import os
import math
from PIL import Image
from src.types.sprites.base_sprite import BaseSprite
from src.helpers.optimize_pngs import optimize_pngs

class AnimationSprite(BaseSprite):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.frames = []
        self.min_x = float('inf')
        self.min_y = float('inf')
        self.max_width = 0
        self.max_height = 0

    def process(self):
        sprite_data = self._generate_base_sprite_data()
        self._collect_frames()
        
        if not self.frames:
            raise ValueError(f"No valid frames found in animation group '{self.layer.name}'")
        
        # Create animation spritesheet
        spritesheet = self._create_spritesheet()
        
        # Save spritesheet
        self._save_image(spritesheet)
        
        # Calculate dimensions
        width = self.max_width - self.min_x
        height = self.max_height - self.min_y
        
        # Update sprite data
        sprite_data.update({
            "filename": self._get_relative_path(),
            "frame_width": width,
            "frame_height": height,
            "frame_count": len(self.frames),
            "columns": self.columns,
            "rows": self.rows,
            "x": self.min_x,
            "y": self.min_y,
            "width": width,
            "height": height
        })
        
        return sprite_data

    def _collect_frames(self):
        # Store original visibility states
        original_visibilities = {layer: layer.visible for layer in self.layer}
        
        try:
            # Make all layers visible
            for layer in self.layer:
                layer.visible = True
            
            for layer in sorted(self.layer, key=lambda x: x.name):
                try:
                    # Attempt to use the layer name as a frame number
                    int(layer.name)
                    frame = layer.composite()
                    self.frames.append((layer, frame))
                    
                    # Update min/max coordinates
                    self.min_x = min(self.min_x, layer.left)
                    self.min_y = min(self.min_y, layer.top)
                    self.max_width = max(self.max_width, layer.right)
                    self.max_height = max(self.max_height, layer.bottom)
                except ValueError:
                    print(f"Warning: Layer name '{layer.name}' in animation group '{self.layer.name}' is not a valid integer. Skipping this frame.")
        finally:
            # Restore original visibility states
            for layer, visibility in original_visibilities.items():
                layer.visible = visibility

    def _create_spritesheet(self):
        frame_count = len(self.frames)
        self.columns = math.ceil(math.sqrt(frame_count))
        self.rows = math.ceil(frame_count / self.columns)
        
        width = self.max_width - self.min_x
        height = self.max_height - self.min_y
        
        spritesheet = Image.new('RGBA', (self.columns * width, self.rows * height), (0, 0, 0, 0))
        
        for index, (layer, frame) in enumerate(self.frames):
            x = (index % self.columns) * width
            y = (index // self.columns) * height
            
            # Position the frame within the cell based on its original position
            frame_x = layer.left - self.min_x
            frame_y = layer.top - self.min_y
            
            spritesheet.paste(frame, (x + frame_x, y + frame_y))
        
        return spritesheet

    def _save_image(self, image):
        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)
        image.save(self.output_path, 'PNG')
        optimize_pngs(self.output_path, self.config.get('optimizePNGs', {}))

    def _process_children(self):
        # Override this method to do nothing for animation sprites
        return None