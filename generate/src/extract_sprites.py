from src.parsers import parse_attributes
from src.createAnimation import create_animation
from src.createSpritesheet import create_spritesheet
from src.packTextures import pack_textures
import os

def extract_sprites(sprites_group, output_dir, initial_layer_order):
    print(f"Exporting sprites...")
    
    sprites_data = []
    current_layer_order = initial_layer_order

    def process_group(group, current_path):
        nonlocal current_layer_order
        group_data = []

        for item in group:
            current_layer_order += 1
            if item.is_group():
                name_type_dict, group_attributes = parse_attributes(item.name)
                
                sprite_data = {
                    **name_type_dict,
                    "x": item.left,
                    "y": item.top,
                    "width": item.width,
                    "height": item.height,
                    "layerOrder": current_layer_order,
                    **group_attributes
                }

                group_type = name_type_dict.get("type", "").lower()

                output_path = os.path.join(output_dir, 'sprites', current_path)
                os.makedirs(output_path, exist_ok=True)

                if group_type == "atlas":
                    try:
                        atlas_layers = []
                        for layer in item:
                            layer_name = layer.name
                            if layer.is_group():
                                layer_image = layer.composite()
                                layer_left = layer.left
                                layer_top = layer.top
                            elif layer.kind in ['pixel', 'shape', 'type', 'smartobject']:
                                layer_image = layer.composite()
                                layer_left = layer.left
                                layer_top = layer.top
                            else:
                                continue

                            if layer_image:
                                atlas_layers.append((layer_name, layer_image, layer_left, layer_top))

                        if atlas_layers:
                            atlas_image, atlas_data = pack_textures(atlas_layers, item.left, item.top)
                            atlas_image_path = os.path.join(output_path, f"{name_type_dict['name']}.png")
                            atlas_image.save(atlas_image_path, 'PNG')

                            sprite_data.update({
                                "name": name_type_dict['name'],
                                "type": "atlas",
                                "x": item.left,
                                "y": item.top,
                                "width": atlas_image.width,
                                "height": atlas_image.height,
                                "atlas_image": os.path.relpath(atlas_image_path, output_dir),
                                "atlas_data": atlas_data  # This now contains only 'frames' and 'placement'
                            })
                        else:
                            print(f"Warning: No valid layers found in atlas group '{name_type_dict['name']}'")
                    except Exception as e:
                        print(f"Error processing atlas group '{name_type_dict['name']}': {str(e)}")
                        continue
                      
                elif group_type == "animation":
                    try:
                        # Store the original visibility states
                        original_visibilities = {}
                        for layer in item.descendants():
                            original_visibilities[layer] = layer.visible
                            layer.visible = True

                        # Create the animation with all layers visible
                        frames, width, height = create_animation(item)
                        spritesheet_path = os.path.join(output_path, f"{name_type_dict['name']}.png")
                        spritesheet_data = create_spritesheet(frames, spritesheet_path, width, height)
                        sprite_data.update(spritesheet_data)
                        sprite_data["width"] = width
                        sprite_data["height"] = height
                        sprite_data["filename"] = os.path.relpath(spritesheet_path, output_dir)

                        # Restore the original visibility states
                        for layer, visibility in original_visibilities.items():
                            layer.visible = visibility

                        print(f"Created animation for '{name_type_dict['name']}' with {len(frames)} frames")
                    except ValueError as e:
                        print(f"Error processing animation group '{name_type_dict['name']}': {str(e)}")
                        continue
                      

                      
                elif group_type == "spritesheet":
                    try:
                        frames = []
                        max_width = max_height = 0
                        placement = []
                        for index, sub_item in enumerate(item):
                            if sub_item.is_group():
                                frame = sub_item.composite()
                            else:
                                frame = sub_item.composite()
                            frames.append(frame)
                            max_width = max(max_width, frame.width)
                            max_height = max(max_height, frame.height)
                            
                            placement.append({
                                "frame": index,
                                "x": sub_item.left - item.left,
                                "y": sub_item.top - item.top
                            })

                        spritesheet_path = os.path.join(output_path, f"{name_type_dict['name']}.png")
                        spritesheet_data = create_spritesheet(frames, spritesheet_path, max_width, max_height)
                        sprite_data.update(spritesheet_data)
                        sprite_data["frame_width"] = max_width
                        sprite_data["frame_height"] = max_height
                        sprite_data["placement"] = placement
                        sprite_data["filename"] = os.path.relpath(spritesheet_path, output_dir)

                        print(f"Created spritesheet for '{name_type_dict['name']}'")
                    except Exception as e:
                        print(f"Error processing spritesheet group '{name_type_dict['name']}': {str(e)}")
                        continue

                elif group_type == "merge":
                    try:
                        merged_image = item.composite()
                        merged_path = os.path.join(output_path, f"{name_type_dict['name']}.png")
                        merged_image.save(merged_path, 'PNG')
                        
                        sprite_data["filename"] = os.path.relpath(merged_path, output_dir)
                        sprite_data["width"] = merged_image.width
                        sprite_data["height"] = merged_image.height

                        print(f"Created merged image for '{name_type_dict['name']}'")
                    except Exception as e:
                        print(f"Error processing merge group '{name_type_dict['name']}': {str(e)}")
                        continue
                else:
                    # For nested groups, recursively process them
                    children = process_group(item, os.path.join(current_path, name_type_dict["name"]))
                    if children:
                        sprite_data["children"] = children

                group_data.append(sprite_data)
            
            elif item.kind in ['pixel', 'shape', 'type', 'smartobject']:
                name_type_dict, layer_attributes = parse_attributes(item.name)
                layer_image = item.composite()
                print(f"   Saving sprite {name_type_dict['name']}...")
                
                sprite_path = os.path.join(output_dir, 'sprites', current_path, f'{name_type_dict["name"]}.png')
                os.makedirs(os.path.dirname(sprite_path), exist_ok=True)
                layer_image.save(sprite_path, 'PNG')
                print(f'Exported layer "{name_type_dict["name"]}" as PNG')
                sprite_data = {
                    **name_type_dict,
                    "x": item.left,
                    "y": item.top,
                    "width": item.width,
                    "height": item.height,
                    "filename": os.path.relpath(sprite_path, output_dir),
                    "layerOrder": current_layer_order,
                    **layer_attributes
                }
                group_data.append(sprite_data)

        return group_data

    # Start processing from the root sprites group
    sprites_data = process_group(sprites_group, '')

    return sprites_data, current_layer_order