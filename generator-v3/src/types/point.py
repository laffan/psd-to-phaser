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
        "x": point_data['left'] + (point_data['width'] / 2),
        "y": point_data['top'] + (point_data['height'] / 2),
    }

    # Add any custom attributes
    if 'attributes' in point_data:
        processed_point.update(point_data['attributes'])

    # Add type if present
    if 'type' in point_data:
        processed_point['type'] = point_data['type']

    return processed_point

def process_point_group(point_group, config):
    """
    Process a group of points.

    Args:
    point_group (list): List of point data dictionaries.
    config (dict): Configuration options.

    Returns:
    list: List of processed point data.
    """
    processed_points = []

    for point in point_group:
        if point['category'] == 'point':
            processed_points.append(process_points(point, config))
        elif point['category'] == 'group' and 'children' in point:
            processed_points.extend(process_point_group(point['children'], config))

    return processed_points