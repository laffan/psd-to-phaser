import os
from psd_tools import PSDImage
from src.helpers.parsers import parse_attributes
from src.types.point import process_points
from src.types.zone import process_zones
from src.types.sprite import Sprite

class PSDProcessor:
    def __init__(self, config):
        self.config = config
        self.output_dir = config['output_dir']
        self.depth_counter = 0
        self.psd_name = None  # Add this line


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
        layers = self.process_layers(psd)
        
        # Reverse the depth values
        max_depth = self.depth_counter - 1
        self.reverse_depth(layers, max_depth)

        psd_data = {
            'name': os.path.splitext(os.path.basename(psd_file))[0],
            'width': psd.width,
            'height': psd.height,
            'layers': layers
        }
        return psd_data

    def process_layers(self, parent_layer):
        layers = []
        for layer in reversed(parent_layer):
            parsed_layer = parse_attributes(layer.name)
            if parsed_layer is None:
                continue  # Skip layers that don't conform to the new naming convention

            layer_info = {
                'name': parsed_layer['name'],
                'category': parsed_layer['category'],
                'x': layer.left + (layer.width / 2),
                'y': layer.top + (layer.height / 2),
                'initialDepth': self.depth_counter
            }
            self.depth_counter += 1  # Increment the depth counter for each valid layer

            # Add all other attributes directly to layer_info
            for key, value in parsed_layer.items():
                if key not in ['name', 'category']:
                    layer_info[key] = value

            if layer_info['category'] == 'point':
                layer_info = process_points(layer_info, self.config)
            elif layer_info['category'] == 'zone':
                layer_info = process_zones(layer_info, layer)
            elif layer_info['category'] == 'sprite':
                sprite = Sprite.create_sprite(layer_info, layer, self.config, self.output_dir, self.psd_name)
                if sprite:
                    layer_info = sprite.process()
                else:
                    # For now, just add a note that this sprite type is not yet processed
                    layer_info['note'] = f"Sprite type '{layer_info.get('type', 'basic')}' not yet processed"
            
            if layer.is_group():
                children = self.process_layers(layer)
                if children:
                    layer_info['children'] = children

            layers.append(layer_info)

        return layers

    def reverse_depth(self, layers, max_depth):
        for layer in layers:
            if layer is None:
                continue
            if 'initialDepth' in layer:
                layer['initialDepth'] = max_depth - layer['initialDepth']
            if 'children' in layer and layer['children']:
                self.reverse_depth(layer['children'], max_depth)