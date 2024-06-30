import os
from PIL import Image
from src.parsers import *

def extract_sprites(sprites_group, output_dir):
    print(f"Exporting sprites...")
    
    sprites_dir = os.path.join(output_dir, 'sprites')
    if not os.path.exists(sprites_dir):
        os.makedirs(sprites_dir)

    sprites_data = []

    for item in sprites_group:
        if item.is_group():
            name_type_dict, group_attributes = parse_attributes(item.name)
            group_dir = os.path.join(sprites_dir, name_type_dict["name"])
            if not os.path.exists(group_dir):
                os.makedirs(group_dir)

            sprite_data = {
                **name_type_dict,
                "x": item.left,
                "y": item.top,
                "width": item.width,
                "height": item.height,
                "components": [],
                **group_attributes
            }
            for layer in item:
                if layer.kind in ['pixel', 'shape', 'type', 'smartobject']:
                    layer_name_type_dict, layer_attributes = parse_attributes(layer.name)
                    layer_image = layer.composite()
                    layer_image.save(os.path.join(group_dir, f'{layer_name_type_dict["name"]}.png'), 'PNG')
                    print(f'Exported layer "{layer_name_type_dict["name"]}" from group "{name_type_dict["name"]}" as PNG')
                    component_data = {
                        **layer_name_type_dict,
                        "x": layer.left,
                        "y": layer.top,
                        "width": layer.width,
                        "height": layer.height,
                        **layer_attributes
                    }
                    sprite_data["components"].append(component_data)
            sprites_data.append(sprite_data)
        elif item.kind in ['pixel', 'shape', 'type', 'smartobject']:
            name_type_dict, layer_attributes = parse_attributes(item.name)
            layer_image = item.composite()
            print(f"   Saving sprite {name_type_dict['name']}...")
            
            layer_image.save(os.path.join(sprites_dir, f'{name_type_dict["name"]}.png'), 'PNG')
            print(f'Exported layer "{name_type_dict["name"]}" as PNG')
            sprite_data = {
                **name_type_dict,
                "x": item.left,
                "y": item.top,
                "width": item.width,
                "height": item.height,
                **layer_attributes
            }
            sprites_data.append(sprite_data)

    return sprites_data