import os
from src.parsers import parse_attributes
from src.createAnimation import create_animation
from src.createSpritesheet import create_spritesheet
from src.packTextures import pack_textures

def extract_sprites(sprites_group, output_dir, initial_layer_order):
    print(f"Exporting sprites...")

    sprites_data = []
    current_layer_order = initial_layer_order
    instance_map = {}  # To keep track of instances
    instance_count = {}  # To keep track of instance counts for each sprite name

    def process_group(group, current_path, parent=None, parent_use_instances=False, parent_instance_depth=float('inf')):
        nonlocal current_layer_order
        group_data = []

        name_type_dict, group_attributes = parse_attributes(group.name)
        use_instances = group_attributes.get('useInstances', parent_use_instances)
        
        if 'instanceDepth' in group_attributes:
            try:
                instance_depth = int(group_attributes['instanceDepth'])
            except ValueError:
                print(f"Warning: Invalid instanceDepth value for group {name_type_dict['name']}. Using parent value.")
                instance_depth = parent_instance_depth
        else:
            instance_depth = parent_instance_depth

        if parent_instance_depth != float('inf'):
            instance_depth = min(instance_depth, parent_instance_depth - 1)

        instance_depth = max(0, instance_depth)

        sprite_data = {
            **name_type_dict,
            "x": group.left,
            "y": group.top,
            "width": group.width,
            "height": group.height,
            "layerOrder": current_layer_order,
            **group_attributes
        }

        if parent:
            sprite_data["parent"] = parent

        group_type = name_type_dict.get("type", "").lower()

        output_path = os.path.join(output_dir, current_path)
        os.makedirs(output_path, exist_ok=True)

        if group_type == "atlas":
            atlas_image, atlas_data = process_atlas(group, output_path, name_type_dict['name'], use_instances, current_path)
            sprite_data.update({
                "type": "atlas",
                "atlas_image": atlas_image,
                "atlas_data": atlas_data
            })
        elif group_type == "animation":
            spritesheet_data = process_animation(group, output_path, name_type_dict['name'], current_path, use_instances)
            sprite_data.update(spritesheet_data)
        elif group_type == "spritesheet":
            spritesheet_data = process_spritesheet(group, output_path, name_type_dict['name'], use_instances, current_path)
            sprite_data.update(spritesheet_data)
        elif group_type == "merge":
            merged_data = process_merge(group, output_path, name_type_dict['name'], current_path, use_instances)
            sprite_data.update(merged_data)
        else:
            for item in group:
                current_layer_order += 1
                if item.is_group():
                    children = process_group(item, os.path.join(current_path, name_type_dict["name"]),
                                             parent=name_type_dict["name"], 
                                             parent_use_instances=use_instances, 
                                             parent_instance_depth=instance_depth)
                    if children:
                        group_data.extend(children)
                elif item.kind in ['pixel', 'shape', 'type', 'smartobject']:
                    item_name_type_dict, item_attributes = parse_attributes(item.name)
                    item_data = process_layer(item, output_path, item_name_type_dict, item_attributes, 
                                              use_instances, current_path, parent=name_type_dict["name"])
                    group_data.append(item_data)

        if group_type in ["atlas", "animation", "spritesheet", "merge"]:
            group_data.append(sprite_data)
        elif not group_type:  # For regular group layers
            group_data.append(sprite_data)

        return group_data

    def process_layer(layer, output_path, name_type_dict, layer_attributes, use_instances, current_path, parent):
        nonlocal current_layer_order
        layer_image = layer.composite()

        sprite_name = name_type_dict['name']
        
        sprite_data = {
            **name_type_dict,
            "x": layer.left,
            "y": layer.top,
            "width": layer.width,
            "height": layer.height,
            "layerOrder": current_layer_order,
            "parent": parent,
            **layer_attributes
        }

        if use_instances:
            instance_count[sprite_name] = instance_count.get(sprite_name, -1) + 1
            sprite_data["instanceName"] = f"{sprite_name}_{instance_count[sprite_name]}"

        if use_instances and sprite_name in instance_map:
            sprite_data.update({
                "filename": instance_map[sprite_name]['filename'],
                "isInstance": True,
                "instanceOf": sprite_name
            })
        else:
            sprite_path = os.path.join(output_path, f'{sprite_name}.png')
            os.makedirs(os.path.dirname(sprite_path), exist_ok=True)
            layer_image.save(sprite_path, 'PNG')
            sprite_data["filename"] = os.path.join(current_path, f'{sprite_name}.png')

            if use_instances:
                instance_map[sprite_name] = sprite_data

        return sprite_data

    def process_atlas(item, output_path, name, use_instances, current_path):
        atlas_layers = []
        unique_frames = {}
        instance_count = {}
        placement = []

        for layer in item:
            layer_name_type_dict, layer_attributes = parse_attributes(layer.name)
            layer_name = layer_name_type_dict['name']
            
            if layer.is_group():
                layer_image = layer.composite()
            elif layer.kind in ['pixel', 'shape', 'type', 'smartobject']:
                layer_image = layer.composite()
            else:
                continue

            if layer_image:
                frame_key = layer_image.tobytes()
                if use_instances and frame_key in unique_frames:
                    frame_name = unique_frames[frame_key]
                else:
                    frame_name = layer_name
                    unique_frames[frame_key] = frame_name
                    atlas_layers.append((frame_name, layer_image, layer.left, layer.top))

                instance_count[frame_name] = instance_count.get(frame_name, -1) + 1
                instance_name = f"{frame_name}_{instance_count[frame_name]}"

                placement.append({
                    "frame": frame_name,
                    "instanceName": instance_name,
                    "relative": {
                        "x": layer.left - item.left,
                        "y": layer.top - item.top
                    },
                    "absolute": {
                        "x": layer.left,
                        "y": layer.top
                    },
                    **layer_attributes
                })

        atlas_image, atlas_data = pack_textures(atlas_layers, item.left, item.top)
        atlas_image_path = os.path.join(output_path, f"{name}.png")
        atlas_image.save(atlas_image_path, 'PNG')

        atlas_data['placement'] = placement

        return os.path.join(current_path, f"{name}.png"), atlas_data

    def process_animation(item, output_path, name, current_path, use_instances):
        frames, width, height = create_animation(item)
        spritesheet_path = os.path.join(output_path, f"{name}.png")
        spritesheet_data = create_spritesheet(frames, spritesheet_path, width, height)
        spritesheet_data["width"] = width
        spritesheet_data["height"] = height
        spritesheet_data["filename"] = os.path.join(current_path, f"{name}.png")

        if use_instances:
            instance_count = {}
            for i, frame in enumerate(frames):
                instance_count[i] = instance_count.get(i, -1) + 1
                instance_name = f"{i}_{instance_count[i]}"
                spritesheet_data.setdefault("placement", []).append({
                    "frame": i,
                    "instanceName": instance_name,
                    "x": 0,
                    "y": 0
                })

        return spritesheet_data

    def process_spritesheet(item, output_path, name, use_instances, current_path):
        frames = []
        max_width = max_height = 0
        placement = []
        unique_frames = {}
        frame_usage_count = {}

        for index, sub_item in enumerate(item):
            if sub_item.is_group():
                frame = sub_item.composite()
            else:
                frame = sub_item.composite()
            
            frame_key = frame.tobytes()
            if use_instances and frame_key in unique_frames:
                frame_index = unique_frames[frame_key]
            else:
                frame_index = len(frames)
                frames.append(frame)
                unique_frames[frame_key] = frame_index
                max_width = max(max_width, frame.width)
                max_height = max(max_height, frame.height)

            frame_usage_count[frame_index] = frame_usage_count.get(frame_index, -1) + 1
            instance_name = f"{frame_index}_{frame_usage_count[frame_index]}"

            name_type_dict, attributes = parse_attributes(sub_item.name)
            placement.append({
                "frame": frame_index,
                "instanceName": instance_name,
                "x": sub_item.left - item.left,
                "y": sub_item.top - item.top,
                **attributes
            })

        spritesheet_path = os.path.join(output_path, f"{name}.png")
        spritesheet_data = create_spritesheet(frames, spritesheet_path, max_width, max_height)
        spritesheet_data["frame_width"] = max_width
        spritesheet_data["frame_height"] = max_height
        spritesheet_data["placement"] = placement
        spritesheet_data["filename"] = os.path.join(current_path, f"{name}.png")
        return spritesheet_data

    def process_merge(item, output_path, name, current_path, use_instances):
        merged_image = item.composite()
        merged_path = os.path.join(output_path, f"{name}.png")
        merged_image.save(merged_path, 'PNG')
        
        merged_data = {
            "filename": os.path.join(current_path, f"{name}.png"),
            "width": merged_image.width,
            "height": merged_image.height
        }

        if use_instances:
            instance_count[name] = instance_count.get(name, -1) + 1
            merged_data["instanceName"] = f"{name}_{instance_count[name]}"

        return merged_data
      
   
    # Start processing from the root sprites group
    sprites_data = process_group(sprites_group, '')

    return sprites_data, current_layer_order