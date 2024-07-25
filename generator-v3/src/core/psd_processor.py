import os
from psd_tools import PSDImage
from src.helpers.parsers import parse_attributes

class PSDProcessor:
    def __init__(self, config):
        self.config = config
        self.output_dir = config['output_dir']
        self.depth_counter = 0

    def process_all_psds(self):
        processed_data = {}
        for psd_file in self.config['psd_files']:
            psd = PSDImage.open(psd_file)
            psd_name = os.path.splitext(os.path.basename(psd_file))[0]
            psd_output_dir = os.path.join(self.config['output_dir'], psd_name)
            os.makedirs(psd_output_dir, exist_ok=True)
            processed_data[psd_name] = self.process_psd(psd, psd_file, psd_output_dir)
        return processed_data

    def process_psd(self, psd, psd_file, psd_output_dir):
        self.depth_counter = 0  # Reset depth counter for each PSD
        layers = self.process_layers(psd)
        
        # Reverse the depth values
        max_depth = self.depth_counter - 1
        for layer in layers:
            layer['initialDepth'] = max_depth - layer['initialDepth']
            if 'children' in layer:
                self.reverse_children_depth(layer['children'], max_depth)

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
                'left': layer.left,
                'top': layer.top,
                'width': layer.width,
                'height': layer.height,
                'initialDepth': self.depth_counter
            }
            self.depth_counter += 1  # Increment the depth counter for each valid layer

            # Add all other attributes directly to layer_info
            for key, value in parsed_layer.items():
                if key not in ['name', 'category']:
                    layer_info[key] = value

            if layer.is_group():
                children = self.process_layers(layer)
                if children:
                    layer_info['children'] = children

            layers.append(layer_info)

        return layers

    def reverse_children_depth(self, children, max_depth):
        for child in children:
            child['initialDepth'] = max_depth - child['initialDepth']
            if 'children' in child:
                self.reverse_children_depth(child['children'], max_depth)