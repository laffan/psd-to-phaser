import os
import math
from PIL import Image
from src.types.sprite import Sprite
from src.helpers.optimize_pngs import optimize_pngs
from src.helpers.parsers import parse_attributes

class SpritesheetSprite(Sprite):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.frame_dict = {}
        self.frames = []
        self.max_width = 0
        self.max_height = 0
        self.layer_order_counter = 0

    def process(self):
        self._collect_frames()
        spritesheet = self._create_spritesheet()
        file_path = self._save_image(spritesheet)

        sprite_data = {
            **self.layer_info,
            "filePath": file_path,
            "frame_width": self.max_width,
            "frame_height": self.max_height,
            "frame_count": len(self.frames),
            "columns": self.columns,
            "rows": self.rows,
            "placement": self._generate_placement()
        }

        return sprite_data

    def _collect_frames(self):
        for child in self.layer:
            parsed_layer = parse_attributes(child.name)
            if parsed_layer is None:
                # If parsing fails, use the layer name as is
                child_name = child.name
                child_attributes = {}
            else:
                child_name = parsed_layer['name']
                child_attributes = parsed_layer.get('attributes', {})

            child_image = child.composite()

            self.max_width = max(self.max_width, child_image.width)
            self.max_height = max(self.max_height, child_image.height)

            frame_name = child_name
            if frame_name not in self.frame_dict:
                self.frame_dict[frame_name] = {
                    'image': child_image,
                    'index': len(self.frames),
                    'instances': []
                }
                self.frames.append((frame_name, child_image))

            instance_name = f"{frame_name}_{len(self.frame_dict[frame_name]['instances'])}"
            instance_data = {
                'attributes': child_attributes,
                'left': child.left,
                'top': child.top,
                'layerOrder': self.layer_order_counter,
                'instanceName': instance_name
            }

            self.frame_dict[frame_name]['instances'].append(instance_data)
            self.layer_order_counter += 1

        if not self.frames:
            raise ValueError("No valid frames found in spritesheet")

    def _create_spritesheet(self):
        frame_count = len(self.frames)
        self.columns = math.ceil(math.sqrt(frame_count))
        self.rows = math.ceil(frame_count / self.columns)

        spritesheet = Image.new('RGBA', (self.columns * self.max_width, self.rows * self.max_height), (0, 0, 0, 0))

        for index, (_, frame) in enumerate(self.frames):
            x = (index % self.columns) * self.max_width
            y = (index // self.columns) * self.max_height

            offset_x = (self.max_width - frame.width) // 2
            offset_y = (self.max_height - frame.height) // 2

            spritesheet.paste(frame, (x + offset_x, y + offset_y), frame)

        return spritesheet

    def _generate_placement(self):
        placement = []

        for name, frame_info in self.frame_dict.items():
            frame_index = frame_info['index']

            for instance in frame_info['instances']:
                placement_entry = {
                    "frame": frame_index,
                    "x": instance['left'] - self.layer.left,
                    "y": instance['top'] - self.layer.top,
                    "layerOrder": instance['layerOrder'],
                    "instanceName": instance['instanceName'],
                    **instance['attributes']
                }
                placement.append(placement_entry)

        return placement

    def _save_image(self, image):
        filename = f"{self.layer_info['name']}.png"
        file_path = self.export_image(image, filename)
        self._optimize_image(file_path)
        return os.path.join('sprites', filename)  # Return the path relative to the PSD output directory


    def _optimize_image(self, file_path):
        optimize_config = self.config.get('optimizePNGs', {})
        optimize_pngs(file_path, optimize_config)