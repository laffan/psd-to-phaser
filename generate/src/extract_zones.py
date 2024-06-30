from psd_tools.api.shape import VectorMask
from src.parsers import parse_attributes

def extract_zones(zones_group):
    print(f"Exporting zones...")
    
    zones_data = []
    
    for layer in zones_group:
        name_type_dict, attributes = parse_attributes(layer.name)
        
        print(f"Processing layer: '{name_type_dict['name']}', Kind: {layer.kind}")
        print(f"Layer '{name_type_dict['name']}' bounding box: left={layer.left}, top={layer.top}, right={layer.right}, bottom={layer.bottom}")
        
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
                
                zone_data = {
                    **name_type_dict,
                    "subpaths": points,
                    "bbox": {
                        "left": layer.left,
                        "top": layer.top,
                        "right": layer.right,
                        "bottom": layer.bottom
                    },
                    **attributes
                }
                if "type" not in name_type_dict:
                    zone_data["type"] = "vector"
            else:
                print(f"Warning: Vector mask found for layer '{name_type_dict['name']}', but no path data available.")
                continue
        else:
            center_x = (layer.right + layer.left) // 2
            center_y = (layer.bottom + layer.top) // 2
            zone_data = {
                **name_type_dict,
                "center_x": center_x,
                "center_y": center_y,
                "width": layer.width,
                "height": layer.height,
                **attributes
            }
            if "type" not in name_type_dict:
                zone_data["type"] = "raster"
        
        zones_data.append(zone_data)
        print(f"Extracted zone data for '{name_type_dict['name']}': {zone_data}")

    return zones_data