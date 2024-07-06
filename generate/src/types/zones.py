""" src/types/zones.py
Processes zone-type layers from PSD files.

This module handles the extraction and processing of zone data
from PSD layers, including boundaries, paths, and custom attributes.

Parameters:
  layer (PSDLayer) = PSD layer object representing a zone

Returns:
  zone_data (dict) = Dictionary containing zone boundaries, paths, and attributes
"""

import logging
from src.helpers.parsers import parse_attributes

def process_zones(zones_group, config):
    logging.debug(f"Processing zones group: {zones_group.name}")

    zones_data = []

    def process_layer(layer, is_child=False):
        name_type_dict, attributes = parse_attributes(layer.name)
        zone_data = {
            "name": name_type_dict.get('name', layer.name),
            **attributes
        }

        if layer.has_vector_mask():
            vector_mask = layer.vector_mask
            if vector_mask and vector_mask.paths:
                points = []
                for subpath in vector_mask.paths:
                    subpath_points = []
                    for knot in subpath:
                        x = int(knot.anchor[1] * zones_group.width)
                        y = int(knot.anchor[0] * zones_group.height)
                        subpath_points.append((x, y))
                    points.append(subpath_points)

                zone_data.update({
                    "subpaths": points,
                    "bbox": {
                        "left": layer.left,
                        "top": layer.top,
                        "right": layer.right,
                        "bottom": layer.bottom
                    }
                })
            else:
                logging.warning(f"Vector mask found for layer '{zone_data['name']}', but no path data available.")
                return None
        else:
            zone_data.update({
                "width": layer.width,
                "height": layer.height,
                "left": layer.left,
                "top": layer.top
            })

        if layer.is_group():
            children = []
            for child_layer in layer:
                child_data = process_layer(child_layer, is_child=True)
                if child_data:
                    children.append(child_data)
            if children:
                zone_data['children'] = children

        logging.debug(f"Processed zone: {zone_data}")
        return zone_data

    for layer in zones_group:
        zone_data = process_layer(layer)
        if zone_data:
            zones_data.append(zone_data)

    logging.debug(f"Processed {len(zones_data)} zones")
    return zones_data