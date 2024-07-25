import os
import math
from PIL import Image
from src.types.sprite import Sprite
from src.helpers.optimize_pngs import optimize_pngs

class AnimationSprite(Sprite):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.frames = []

    def process(self):
        self._collect_frames()
        if not self.frames:
            raise ValueError(f"No valid frames found in animation group '{self.layer.name}'")

        spritesheet = self._create_spritesheet()
        file_path = self._save_image(spritesheet)

        sprite_data = {
            **self.layer_info,
            "filePath": file_path,
            "frame_width": self.layer.width,
            "frame_height": self.layer.height,
            "frame_count": len(self.frames),
            "columns": self.columns,
            "rows": self.rows,
            "x": self.layer.left,
            "y": self.layer.top,
            "width": self.layer.width,
            "height": self.layer.height
        }

        return sprite_data

    def _collect_frames(self):
        original_visibilities = {layer: layer.visible for layer in self.layer}

        try:
            for layer in self.layer:
                layer.visible = True

            for layer in sorted(self.layer, key=lambda x: x.name):
                try:
                    int(layer.name)  # Attempt to use the layer name as a frame number
                    frame = layer.composite()
                    self.frames.append((layer, frame))
                except ValueError:
                    print(f"Warning: Layer name '{layer.name}' in animation group '{self.layer.name}' is not a valid integer. Skipping this frame.")
        finally:
            for layer, visibility in original_visibilities.items():
                layer.visible = visibility

    def _create_spritesheet(self):
        frame_count = len(self.frames)
        self.columns = math.ceil(math.sqrt(frame_count))
        self.rows = math.ceil(frame_count / self.columns)

        group_width = self.layer.width
        group_height = self.layer.height

        spritesheet = Image.new('RGBA', (self.columns * group_width, self.rows * group_height), (0, 0, 0, 0))

        for index, (layer, frame) in enumerate(self.frames):
            x = (index % self.columns) * group_width
            y = (index // self.columns) * group_height

            # Create a new image with the group's dimensions
            frame_image = Image.new('RGBA', (group_width, group_height), (0, 0, 0, 0))
            
            # Calculate the position of the frame within the group
            frame_x = layer.left - self.layer.left
            frame_y = layer.top - self.layer.top
            
            # Paste the frame onto the group-sized image
            frame_image.paste(frame, (frame_x, frame_y))
            
            # Paste the group-sized image onto the spritesheet
            spritesheet.paste(frame_image, (x, y))

        return spritesheet

    def _save_image(self, image):
        filename = f"{self.layer_info['name']}.png"
        file_path = self.export_image(image, filename)
        self._optimize_image(file_path)
        return os.path.join('sprites', filename)

    def _optimize_image(self, file_path):
        optimize_config = self.config.get('optimizePNGs', {})
        optimize_pngs(file_path, optimize_config)