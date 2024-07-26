import os
import math
from PIL import Image
from src.types.sprite import Sprite
from src.helpers.optimize_pngs import optimize_pngs

class AnimationSprite(Sprite):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.frames = []
        self.min_x = float('inf')
        self.min_y = float('inf')
        self.max_width = 0
        self.max_height = 0

    def process(self):
        self._collect_frames()
        if not self.frames:
            raise ValueError(f"No valid frames found in animation group '{self.layer.name}'")

        spritesheet = self._create_spritesheet()
        file_path = self._save_image(spritesheet)

        width = self.max_width - self.min_x
        height = self.max_height - self.min_y

        sprite_data = {
            **self.layer_info,
            "filePath": file_path,
            "frame_width": width,
            "frame_height": height,
            "frame_count": len(self.frames),
            "columns": self.columns,
            "rows": self.rows,
            "x": self.min_x,
            "y": self.min_y,
            "width": width,
            "height": height
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

                    self.min_x = min(self.min_x, layer.left)
                    self.min_y = min(self.min_y, layer.top)
                    self.max_width = max(self.max_width, layer.right)
                    self.max_height = max(self.max_height, layer.bottom)
                except ValueError:
                    print(f"Warning: Layer name '{layer.name}' in animation group '{self.layer.name}' is not a valid integer. Skipping this frame.")
        finally:
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

            frame_x = layer.left - self.min_x
            frame_y = layer.top - self.min_y

            spritesheet.paste(frame, (x + frame_x, y + frame_y))

        return spritesheet

    def _save_image(self, image):
        filename = f"{self.layer_info['name']}.png"
        file_path = self.export_image(image, filename)
        self._optimize_image(file_path)
        return os.path.join('sprites', filename)

    def _optimize_image(self, file_path):
        optimize_config = self.config.get('optimizePNGs', {})
        optimize_pngs(file_path, optimize_config)