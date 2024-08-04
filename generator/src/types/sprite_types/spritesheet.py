import os
import math
from PIL import Image
from psd_tools.api.layers import Layer, Group
from src.types.sprite import Sprite
from src.helpers.optimize_pngs import optimize_pngs
from src.helpers.parsers import parse_attributes

class SpritesheetSprite(Sprite):
    def __init__(self, layer_info, layer, config, output_dir, psd_name):
        super().__init__(layer_info, layer, config, output_dir, psd_name)
        self.frames = []
        self.unique_frames = {}
        self.instances = []
        self.layer_order_counter = 0
        self.max_width = 0
        self.max_height = 0

    def process(self):
        self._collect_frames()
        if not self.unique_frames:
            print(f"Warning: No valid frames found for spritesheet '{self.layer_info['name']}'. Skipping spritesheet creation.")
            return None
        spritesheet_image = self._create_spritesheet()
        file_path = self._save_image(spritesheet_image)

        sprite_data = {
            **self.layer_info,
            "filePath": file_path,
            "frame_width": self.max_width,
            "frame_height": self.max_height,
            "frame_count": len(self.frames),
            "columns": self.columns,
            "rows": self.rows,
            "instances": self.instances,
            "frames": self._generate_frames()
        }

        return sprite_data

    def _collect_frames(self):
        if isinstance(self.layer, Group):
            for child in self.layer:
                self._process_layer(child)
        else:
            print(f"Warning: Spritesheet layer '{self.layer_info['name']}' is not a group. Skipping spritesheet creation.")
        self.frames = list(self.unique_frames.values())

    def _process_layer(self, layer):
        if layer is None or not layer.is_visible():
            return
        frame = self._create_frame(layer)
        if frame:
            if frame['name'] not in self.unique_frames:
                self.unique_frames[frame['name']] = frame
            self._add_instance(frame, layer)

    def _create_frame(self, layer):
        frame = {
            'name': layer.name,
            'image': layer.composite(),
            'order': self.layer_order_counter,
            'width': layer.width,
            'height': layer.height
        }
        self.max_width = max(self.max_width, frame['width'])
        self.max_height = max(self.max_height, frame['height'])
        self.layer_order_counter += 1
        return frame

    def _add_instance(self, frame, layer):
        self.instances.append({
            'name': layer.name,
            'x': layer.left,
            'y': layer.top,
        })

    def _create_spritesheet(self):
        frame_count = len(self.frames)
        self.columns = math.ceil(math.sqrt(frame_count))
        self.rows = math.ceil(frame_count / self.columns)

        spritesheet = Image.new('RGBA', (self.columns * self.max_width, self.rows * self.max_height), (0, 0, 0, 0))

        for index, frame in enumerate(self.frames):
            x = (index % self.columns) * self.max_width
            y = (index // self.columns) * self.max_height

            offset_x = (self.max_width - frame['width']) // 2
            offset_y = (self.max_height - frame['height']) // 2

            spritesheet.paste(frame['image'], (x + offset_x, y + offset_y), frame['image'])
            frame['spritesheet_x'] = x
            frame['spritesheet_y'] = y

        return spritesheet

    def _generate_frames(self):
        return {
            frame['name']: {
                'x': frame['spritesheet_x'],
                'y': frame['spritesheet_y'],
                'width': frame['width'],
                'height': frame['height']
            } for frame in self.frames
        }

    def _save_image(self, image):
        filename = f"{self.layer_info['name']}.png"
        file_path = self.export_image(image, filename)
        self._optimize_image(file_path)
        return os.path.join('sprites', filename)  # Return the path relative to the PSD output directory

    def _optimize_image(self, file_path):
        optimize_config = self.config.get('optimizePNGs', {})
        optimize_pngs(file_path, optimize_config)