import os
from PIL import Image
from src.parsers import parse_attributes
from src.createAnimation import create_animation
from src.createSpritesheet import create_spritesheet
from src.createTextureAtlas import create_texture_atlas

def extract_sprites(sprites_group, output_dir):
    print(f"Exporting sprites...")
    
    sprites_dir = os.path.join(output_dir, 'sprites')
    if not os.path.exists(sprites_dir):
        os.makedirs(sprites_dir)

    sprites_data = []

    for item in sprites_group:
        if item.is_group():
            name_type_dict, group_attributes = parse_attributes(item.name)
            
            sprite_data = {
                **name_type_dict,
                "x": item.left,
                "y": item.top,
                "width": item.width,
                "height": item.height,
                **group_attributes
            }

            if name_type_dict.get("type") == "animation":
                try:
                    frames, width, height = create_animation(item)
                    spritesheet_path = os.path.join(sprites_dir, f"{name_type_dict['name']}_animation.png")
                    spritesheet_data = create_spritesheet(frames, spritesheet_path, width, height)
                    sprite_data.update(spritesheet_data)
                    sprite_data["width"] = width
                    sprite_data["height"] = height
                except ValueError as e:
                    print(f"Error processing animation group '{name_type_dict['name']}': {str(e)}")
                    continue
            elif name_type_dict.get("type") == "atlas":
                try:
                    atlas_image_path, atlas_json = create_texture_atlas(item, sprites_dir)
                    sprite_data["atlas_image"] = os.path.basename(atlas_image_path)
                    sprite_data["atlas_data"] = atlas_json
                    
                    print(f"Created texture atlas for '{name_type_dict['name']}'")
                except Exception as e:
                    print(f"Error processing atlas group '{name_type_dict['name']}': {str(e)}")
                    continue
            else:
                group_dir = os.path.join(sprites_dir, name_type_dict["name"])
                if not os.path.exists(group_dir):
                    os.makedirs(group_dir)
                sprite_data["components"] = []
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