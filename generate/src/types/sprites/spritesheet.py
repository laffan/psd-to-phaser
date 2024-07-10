import os
import math
from PIL import Image
from src.types.sprites.base_sprite import BaseSprite
from src.helpers.optimize_pngs import optimize_pngs
from src.helpers.parsers import parse_attributes

class SpritesheetSprite(BaseSprite):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.frame_dict = {}
        self.frames = []
        self.max_width = 0
        self.max_height = 0
        self.layer_order_counter = 0

    def process(self):
        sprite_data = self._generate_base_sprite_data()
        self._collect_frames()

        spritesheet = self._create_spritesheet()
        self._save_image(spritesheet)

        sprite_data.update({
            "filename": self._get_relative_path(),
            "frame_width": self.max_width,
            "frame_height": self.max_height,
            "frame_count": len(self.frames),
            "columns": self.columns,
            "rows": self.rows,
            "placement": self._generate_placement()
        })

        return sprite_data

    def _collect_frames(self):
        for child in self.layer:
            child_name, child_attributes = parse_attributes(child.name)
            child_props = self._get_layer_properties(child)  # Capture properties first
            child_image = self._get_composite_image(child)  # Then get the composite image

            self.max_width = max(self.max_width, child_image.width)
            self.max_height = max(self.max_height, child_image.height)

            if child_name['name'] in self.frame_dict:
                instance_index = len(self.frame_dict[child_name['name']]['instances'])
                instance_name = f"{child_name['name']}_{instance_index}"
            else:
                instance_index = 0
                instance_name = f"{child_name['name']}_{instance_index}"
                self.frames.append((child_name['name'], child_image))

            if child_name['name'] not in self.frame_dict:
                self.frame_dict[child_name['name']] = {
                    'image': child_image,
                    'index': len(self.frames) - 1,
                    'instances': []
                }

            instance_data = {
                'attributes': child_attributes,
                'left': child.left,
                'top': child.top,
                'layerOrder': self.layer_order_counter,
                'instanceName': instance_name,
                **child_props  # Include child properties
            }

            self.frame_dict[child_name['name']]['instances'].append(instance_data)
            self.layer_order_counter += 1

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
            x = (frame_index % self.columns) * self.max_width
            y = (frame_index // self.columns) * self.max_height

            for instance in frame_info['instances']:
                placement_entry = {
                    "frame": frame_index,
                    "x": instance['left'] - self.layer.left,
                    "y": instance['top'] - self.layer.top,
                    "layerOrder": instance['layerOrder'],
                    "instanceName": instance['instanceName'],
                    **instance['attributes']
                }
                
                # Include captured properties in placement
                for prop in self.capture_props:
                    if prop in instance:
                        placement_entry[prop] = instance[prop]

                placement.append(placement_entry)

        return placement

    def _save_image(self, image):
        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)
        image.save(self.output_path, 'PNG')
        optimize_pngs(self.output_path, self.config.get('optimizePNGs', {}))

    def _process_children(self):
        # Override this method to do nothing for spritesheet sprites
        return None