def process_points(point_data, config):
    """
    Process point data and return the processed point information.

    Args:
    point_data (dict): The point data extracted from the PSD layer.
    config (dict): Configuration options.

    Returns:
    dict: Processed point data.
    """
    processed_point = {
        "name": point_data['name'],
        "category": "point",
        "x": point_data['x'],
        "y": point_data['y'],
        "initialDepth": point_data['initialDepth']
    }

    # Add any custom attributes
    for key, value in point_data.items():
        if key not in ['name', 'category', 'x', 'y', 'initialDepth']:
            processed_point[key] = value

    return processed_point
