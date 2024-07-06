""" src/types/points.py
Processes point-type layers from PSD files.

This module handles the extraction and processing of point data
from PSD layers, including position and custom attributes.

Parameters:
  layer (PSDLayer) = PSD layer object representing a point

Returns:
  point_data (dict) = Dictionary containing point coordinates and attributes
"""

import logging
from src.helpers.parsers import parse_attributes

def process_points(points_group, config):
    logging.debug(f"Processing points group: {points_group.name}")
    
    points_data = []
    
    def process_layer(layer, is_child=False):
        name_type_dict, attributes = parse_attributes(layer.name)
        point_data = {
            "name": name_type_dict.get('name', layer.name),
            "x": layer.left + (layer.width / 2),
            "y": layer.top + (layer.height / 2),
            **attributes
        }
        
        if 'type' in name_type_dict:
            point_data['type'] = name_type_dict['type']
        
        if layer.is_group():
            children = []
            for child_layer in layer:
                child_data = process_layer(child_layer, is_child=True)
                if child_data:
                    children.append(child_data)
            if children:
                point_data['children'] = children
        elif not layer.kind in ['pixel', 'shape', 'type', 'smartobject']:
            return None

        logging.debug(f"Processed point: {point_data}")
        return point_data

    for layer in points_group:
        point_data = process_layer(layer)
        if point_data:
            points_data.append(point_data)

    logging.debug(f"Processed {len(points_data)} points")
    return points_data