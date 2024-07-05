from src.parsers import *

def extract_points(points_group):
    print(f"Exporting points...")
    
    points_data = []
    
    for layer in points_group:
        if layer.kind in ['pixel', 'shape', 'type', 'smartobject']:
            name_type_dict, attributes = parse_attributes(layer.name)
            point_data = {
                **name_type_dict,
                "x": layer.left + (layer.width / 2),
                "y": layer.top + (layer.height / 2),
                **attributes
            }
            points_data.append(point_data)

    return points_data