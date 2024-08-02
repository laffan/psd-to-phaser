import os
from PIL import Image
from psd_tools.api.layers import Layer, Group
from src.types.sprite import Sprite
from src.helpers.optimize_pngs import optimize_pngs

class AtlasSprite(Sprite):
    def __init__(self, layer_info, layer, config, output_dir, psd_name):
        super().__init__(layer_info, layer, config, output_dir, psd_name)
        self.type = 'atlas'
        self.frames = []
        self.unique_frames = {}
        self.instances = []
        self.layer_order_counter = 0
        self.data = {
            'name': self.layer_info['name'],
            'type': self.type,
        }

    def process(self):
        self._collect_frames()
        if not self.unique_frames:
            print(f"Warning: No valid frames found for atlas '{self.layer_info['name']}'. Skipping atlas creation.")
            return None
        atlas_image, atlas_data = self._create_atlas()
        self._save_image(atlas_image)
        self.data.update(atlas_data)
        return self.data

    def _collect_frames(self):
        if isinstance(self.layer, Group):
            for child in self.layer:
                self._process_layer(child)
        else:
            print(f"Warning: Atlas layer '{self.layer_info['name']}' is not a group. Skipping atlas creation.")
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
        self.layer_order_counter += 1
        return frame

    def _add_instance(self, frame, layer):
        self.instances.append({
            'name': layer.name,
            'x': layer.left,
            'y': layer.top,
        })

    def _create_atlas(self):
        total_width = sum(frame['width'] for frame in self.frames)
        total_height = sum(frame['height'] for frame in self.frames)
        max_width = max(frame['width'] for frame in self.frames)
        max_height = max(frame['height'] for frame in self.frames)

        atlas_image = Image.new('RGBA', (total_width, total_height), (0, 0, 0, 0))

        x_offset = 0
        y_offset = 0
        for frame in self.frames:
            atlas_image.paste(frame['image'], (x_offset, y_offset))
            frame['atlas_x'] = x_offset
            frame['atlas_y'] = y_offset
            x_offset += frame['width']
            if x_offset + max_width > total_width:
                x_offset = 0
                y_offset += max_height

        atlas_data = {
            'instances': self.instances,
            'frames': {
                frame['name']: {
                    'x': frame['atlas_x'],
                    'y': frame['atlas_y'],
                    'width': frame['width'],
                    'height': frame['height']
                } for frame in self.frames
            }
        }

        return atlas_image, atlas_data

    def _save_image(self, image):
        filename = f"{self.layer_info['name']}.png"
        filepath = self.export_image(image, filename)
        self.data['filePath'] = filepath

    def export(self):
        return self.data