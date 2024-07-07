import os
from PIL import Image
from src.types.sprites.base_sprite import BaseSprite
from src.helpers.pack_textures import pack_textures
from src.helpers.optimize_pngs import optimize_pngs
from src.helpers.parsers import parse_attributes

# Atlas formatting based off of
# https://phaser.io/sandbox/?src=src/loader\texture%20atlas%20json\get%20atlas%20meta%20data.js


class AtlasSprite(BaseSprite):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.frames = []
        self.frame_dict = {}
        self.layer_order_counter = 0

    def process(self):
        sprite_data = self._generate_base_sprite_data()
        self._collect_frames()

        # Create atlas
        atlas_image, atlas_data = self._create_atlas()

        # Save atlas image
        self._save_image(atlas_image)

        # Update sprite data with new structure
        sprite_data.update({
            "type": "atlas",
            "layerOrder": self.layer_order_counter,
            "name": self.name_type_dict.get('name', self.layer.name),
            "filePath": self._get_relative_path(),
            "atlas": {
                "frames": self._generate_frames(atlas_data),
                "meta": self._generate_meta(atlas_image)
            },
            "placement": self._generate_placement(atlas_data)
        })

        return sprite_data

    def _collect_frames(self):
        for child in self.layer:
            name, attributes = parse_attributes(child.name)
            frame = child.composite()

            frame_name = name.get('name', child.name)
            if frame_name not in self.frame_dict:
                self.frame_dict[frame_name] = {
                    'image': frame,
                    'instances': []
                }
                self.frames.append((frame_name, frame, child.left, child.top))

            instance_name = f"{frame_name}_{len(self.frame_dict[frame_name]['instances'])}"

            self.frame_dict[frame_name]['instances'].append({
                'attributes': attributes,
                'left': child.left,
                'top': child.top,
                'layerOrder': self.layer_order_counter,
                'instanceName': instance_name
            })
            self.layer_order_counter += 1

    def _create_atlas(self):
        return pack_textures(self.frames, self.layer.left, self.layer.top)

    def _generate_frames(self, atlas_data):
        frames = []
        for frame in atlas_data['frames']:
            frames.append({
                "filename": frame['name'],
                "frame": {
                    "x": frame['x'],
                    "y": frame['y'],
                    "w": frame['w'],
                    "h": frame['h']
                },
                "rotated": False,
                "trimmed": False,
                "spriteSourceSize": {
                    "x": 0,
                    "y": 0,
                    "w": frame['w'],
                    "h": frame['h']
                },
                "sourceSize": {
                    "w": frame['w'],
                    "h": frame['h']
                },
                "pivot": {
                    "x": 0,
                    "y": 0
                }
            })
        return frames

    def _generate_meta(self, atlas_image):
        return {
            "app": "http://www.codeandweb.com/texturepacker",
            "version": "1.0",
            "image": self._get_relative_path(),
            "format": "RGBA8888",
            "size": {
                "w": atlas_image.width,
                "h": atlas_image.height
            },
            "scale": "1",
            "smartupdate": "$TexturePacker:SmartUpdate:5e8f90752cfd57d3adfb39bcd3eef1b6:87d98cec6fa616080f731b87726d6a1e:b55588eba103b49b35a0a59665ed84fd$"
        }

    def _generate_placement(self, atlas_data):
        placement = []
        for frame_name, frame_info in self.frame_dict.items():
            for instance in frame_info['instances']:
                placement.append({
                    "frame": frame_name,
                    "layerOrder": instance['layerOrder'],
                    "instanceName": instance['instanceName'],
                    "x": instance['left'] - self.layer.left,
                    "y": instance['top'] - self.layer.top,
                    **instance['attributes']
                })
        return placement

    def _save_image(self, image):
        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)
        image.save(self.output_path, 'PNG')
        optimize_pngs(self.output_path, self.config.get('optimizePNGs', {}))

    def _process_children(self):
        # Override this method to do nothing for atlas sprites
        return None