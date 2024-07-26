def process_zones(zone_data, layer):
    """
    Process zone data and return the processed zone information.

    Args:
    zone_data (dict): The zone data extracted from the PSD layer.
    layer (Layer): The PSD layer object.

    Returns:
    dict: Processed zone data.
    """
    processed_zone = {
        "name": zone_data['name'],
        "category": "zone",
        "x": zone_data['x'],
        "y": zone_data['y'],
        "initialDepth": zone_data['initialDepth']
    }

    # Process vector mask if present
    if layer.has_vector_mask():
        vector_mask = layer.vector_mask
        if vector_mask and vector_mask.paths:
            points = []
            for subpath in vector_mask.paths:
                subpath_points = []
                for knot in subpath:
                    x = int(knot.anchor[1] * layer._psd.width)
                    y = int(knot.anchor[0] * layer._psd.height)
                    subpath_points.append((x, y))
                points.append(subpath_points)
            processed_zone["subpaths"] = points
            processed_zone["bbox"] = {
                "left": layer.left,
                "top": layer.top,
                "right": layer.right,
                "bottom": layer.bottom
            }
    else:
        processed_zone["width"] = layer.width
        processed_zone["height"] = layer.height

    # Add any custom attributes
    for key, value in zone_data.items():
        if key not in ['name', 'category', 'x', 'y', 'initialDepth']:
            processed_zone[key] = value

    return processed_zone