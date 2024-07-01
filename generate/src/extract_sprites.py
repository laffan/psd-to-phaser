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

    def process_group(group, current_path):
        group_data = []

        for item in group:
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

                group_type = name_type_dict.get("type", "").lower()

                if group_type in ["animation", "atlas", "spritesheet", "merge"]:
                    # For special types, save files directly in the current path
                    output_path = os.path.join(sprites_dir, current_path)
                else:
                    # For regular groups, create a new subfolder
                    output_path = os.path.join(sprites_dir, current_path, name_type_dict["name"])
                
                os.makedirs(output_path, exist_ok=True)

                if group_type == "animation":
                    try:
                        # Temporarily make all layers visible
                        original_visibilities = {}
                        for layer in item.descendants():
                            original_visibilities[layer] = layer.visible
                            layer.visible = True

                        frames, width, height = create_animation(item)
                        spritesheet_path = os.path.join(output_path, f"{name_type_dict['name']}_animation.png")
                        spritesheet_data = create_spritesheet(frames, spritesheet_path, width, height)
                        sprite_data.update(spritesheet_data)
                        sprite_data["width"] = width
                        sprite_data["height"] = height

                        # Restore original visibility
                        for layer, visibility in original_visibilities.items():
                            layer.visible = visibility
                    except ValueError as e:
                        print(f"Error processing animation group '{name_type_dict['name']}': {str(e)}")
                        continue
                elif group_type == "atlas":
                    try:
                        atlas_image_path, atlas_json = create_texture_atlas(item, output_path)
                        sprite_data["atlas_image"] = os.path.relpath(atlas_image_path, sprites_dir)
                        sprite_data["atlas_data"] = atlas_json
                        print(f"Created texture atlas for '{name_type_dict['name']}'")
                    except Exception as e:
                        print(f"Error processing atlas group '{name_type_dict['name']}': {str(e)}")
                        continue
                elif group_type == "spritesheet":
                    try:
                        # Temporarily make all layers visible
                        original_visibilities = {}
                        for layer in item.descendants():
                            original_visibilities[layer] = layer.visible
                            layer.visible = True

                        # Process frames
                        frames = []
                        max_width = max_height = 0
                        for sub_item in sorted(item, key=lambda x: x.name):
                            if sub_item.is_group():
                                frame = sub_item.composite()
                            else:
                                frame = sub_item.composite()
                            frames.append(frame)
                            max_width = max(max_width, frame.width)
                            max_height = max(max_height, frame.height)

                        # Create centered frames
                        centered_frames = []
                        for frame in frames:
                            new_frame = Image.new('RGBA', (max_width, max_height), (0, 0, 0, 0))
                            x = (max_width - frame.width) // 2
                            y = (max_height - frame.height) // 2
                            new_frame.paste(frame, (x, y), frame)
                            centered_frames.append(new_frame)

                        spritesheet_path = os.path.join(output_path, f"{name_type_dict['name']}.png")
                        spritesheet_data = create_spritesheet(centered_frames, spritesheet_path, max_width, max_height)
                        sprite_data.update(spritesheet_data)
                        sprite_data["frame_width"] = max_width
                        sprite_data["frame_height"] = max_height

                        # Restore original visibility
                        for layer, visibility in original_visibilities.items():
                            layer.visible = visibility

                        print(f"Created spritesheet for '{name_type_dict['name']}'")
                    except Exception as e:
                        print(f"Error processing spritesheet group '{name_type_dict['name']}': {str(e)}")
                        continue
                elif group_type == "merge":
                    try:
                        # Temporarily make all layers visible
                        original_visibilities = {}
                        for layer in item.descendants():
                            original_visibilities[layer] = layer.visible
                            layer.visible = True

                        # Merge all layers into a single image
                        merged_image = item.composite()
                        
                        # Save the merged image
                        merged_path = os.path.join(output_path, f"{name_type_dict['name']}.png")
                        merged_image.save(merged_path, 'PNG')
                        
                        sprite_data["image"] = os.path.relpath(merged_path, sprites_dir)
                        sprite_data["width"] = merged_image.width
                        sprite_data["height"] = merged_image.height

                        print(f"Created merged image for '{name_type_dict['name']}'")

                        # Restore original visibility
                        for layer, visibility in original_visibilities.items():
                            layer.visible = visibility
                    except Exception as e:
                        print(f"Error processing merge group '{name_type_dict['name']}': {str(e)}")
                        continue
                else:
                    # Recursively process nested groups only for non-special types
                    children = process_group(item, os.path.join(current_path, name_type_dict["name"]))
                    if children:
                        sprite_data["children"] = children

                group_data.append(sprite_data)
            
            elif item.kind in ['pixel', 'shape', 'type', 'smartobject']:
                name_type_dict, layer_attributes = parse_attributes(item.name)
                layer_image = item.composite()
                print(f"   Saving sprite {name_type_dict['name']}...")
                
                sprite_path = os.path.join(sprites_dir, current_path, f'{name_type_dict["name"]}.png')
                os.makedirs(os.path.dirname(sprite_path), exist_ok=True)
                layer_image.save(sprite_path, 'PNG')
                print(f'Exported layer "{name_type_dict["name"]}" as PNG')
                sprite_data = {
                    **name_type_dict,
                    "x": item.left,
                    "y": item.top,
                    "width": item.width,
                    "height": item.height,
                    **layer_attributes
                }
                group_data.append(sprite_data)

        return group_data

    # Start processing from the root sprites group
    sprites_data = process_group(sprites_group, '')

    return sprites_data