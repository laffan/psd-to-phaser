from psd_tools import PSDImage
from psd_tools.constants import BlendMode
import os
from src.helpers.parsers import parse_attributes
from src.types.point import process_points
from src.types.zone import process_zones
from src.types.sprite import Sprite
from src.types.tiles import Tiles

class PSDProcessor:
    def __init__(self, config):
        self.config = config
        self.output_dir = config['output_dir']
        self.depth_counter = 0
        self.psd_name = None

    def process_all_psds(self):
        processed_data = {}
        for psd_file in self.config['psd_files']:
            self.depth_counter = 0  # Reset depth counter for each PSD
            psd = PSDImage.open(psd_file)
            psd_name = os.path.splitext(os.path.basename(psd_file))[0]
            psd_output_dir = os.path.join(self.config['output_dir'], psd_name)
            os.makedirs(psd_output_dir, exist_ok=True)
            processed_data[psd_name] = self.process_psd(psd, psd_file, psd_output_dir)
        return processed_data

    def process_psd(self, psd, psd_file, psd_output_dir):
        self.psd_name = os.path.splitext(os.path.basename(psd_file))[0]
        self.tiles_processor = Tiles(self.config, psd_output_dir)

        layers = self.process_layers(psd)

        # Reverse the depth values
        max_depth = self.depth_counter - 1
        self.reverse_depth(layers, max_depth)

        psd_data = {
            'name': os.path.splitext(os.path.basename(psd_file))[0],
            'width': psd.width,
            'height': psd.height,
            'tile_slice_size': self.config.get('tile_slice_size', 512),
            'tile_scaled_versions': self.config.get('tile_scaled_versions', []),
            'layers': layers
        }
        return psd_data

    def process_layers(self, parent_layer):
        layers = []

        for layer in reversed(parent_layer):
            parsed_layer = parse_attributes(layer.name)
            if parsed_layer is None:
                continue  # Skip layers that don't conform to the new naming convention

            # Unpack the bbox tuple
            x1, y1, x2, y2 = layer.bbox

            layer_info = {
                'name': parsed_layer['name'],
                'category': parsed_layer['category'],
                'x': x1,
                'y': y1,
                'width': x2 - x1,
                'height': y2 - y1,
                'initialDepth': self.depth_counter,
                'attributes': {
                    key: value
                    for key, value in parsed_layer.items()
                    if key not in ['name', 'category', 'type']
                }}

            # If 'type' exists in parsed_layer, add it to the top level
            if 'type' in parsed_layer:
                layer_info['type'] = parsed_layer['type']
                
                                
            self.depth_counter += 1

            if layer_info['category'] == 'point':
                # For points, adjust to the center of the layer
                layer_info['x'] += layer_info['width'] / 2
                layer_info['y'] += layer_info['height'] / 2
                layer_info = process_points(layer_info, self.config)
            elif layer_info['category'] == 'zone':
                layer_info = process_zones(layer_info, layer)
            elif layer_info['category'] == 'tileset':
                # Pass the entire layer to process_tiles, not just the layer_info
                tile_info = self.tiles_processor.process_tiles(layer)
                layer_info.update(tile_info)
                layer_info['initialDepth'] = layer_info.pop('initialDepth', self.depth_counter - 1)
            elif layer_info['category'] == 'sprite':
                sprite = Sprite.create_sprite(layer_info, layer, self.config, self.output_dir, self.psd_name)
                if sprite:
                    sprite_info = sprite.process()
                    layer_info.update(sprite_info)
                    layer_info['initialDepth'] = layer_info.pop('initialDepth', self.depth_counter - 1)
                else:
                    layer_info['note'] = f"Sprite type '{layer_info.get('type', 'basic')}' not yet processed"

            if layer.is_group():
                children = self.process_layers(layer)
                if children:
                    layer_info['children'] = children

            # Capture alpha and blend mode
            layer_info = self.capture_layer_properties(layer, layer_info)

            layers.append(layer_info)

        return layers
      
    def capture_layer_properties(self, layer, layer_info):
        # Capture alpha if not 100%
        if layer.opacity != 255:
            layer_info['alpha'] = round(layer.opacity / 255, 2)

        # Capture blend mode if not PASS_THROUGH or NORMAL
        blend_mode = layer.blend_mode

        if blend_mode not in [BlendMode.PASS_THROUGH, BlendMode.NORMAL]:
            layer_info['blendMode'] = blend_mode.name
            print(blend_mode.name)
            print(layer_info)
        return layer_info

    def reverse_depth(self, layers, max_depth):
        for layer in layers:
            if layer is None:
                continue
            if 'initialDepth' in layer:
                layer['initialDepth'] = max_depth - layer['initialDepth']
            if 'children' in layer and layer['children']:
                self.reverse_depth(layer['children'], max_depth)