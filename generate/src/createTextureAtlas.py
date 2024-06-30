from PIL import Image
from src.parsers import parse_attributes

def create_texture_atlas(group, output_dir):
    name_type_dict, _ = parse_attributes(group.name)
    atlas_name = name_type_dict["name"]
    frames = []
    frame_data = {}

    # Collect frame data without saving individual files
    for layer in group:
        if layer.kind in ['pixel', 'shape', 'type', 'smartobject']:
            layer_name_type_dict, layer_attributes = parse_attributes(layer.name)
            layer_name = layer_name_type_dict["name"]
            
            layer_image = layer.composite()
            
            frames.append({
                "name": layer_name,
                "image": layer_image,
                "width": layer_image.width,
                "height": layer_image.height
            })
            
            frame_data[layer_name] = {
                "frame": {"x": 0, "y": 0, "w": layer_image.width, "h": layer_image.height},
                "sourceSize": {"w": layer_image.width, "h": layer_image.height}
            }

    # Sort frames by area in descending order
    frames.sort(key=lambda x: x["width"] * x["height"], reverse=True)

    # Determine initial atlas size (start with the largest frame)
    atlas_size = max(frames[0]["width"], frames[0]["height"])

    while True:
        positions = pack_frames(frames, atlas_size)
        if positions:
            break
        atlas_size *= 2

    # Create the atlas image
    atlas_image = Image.new('RGBA', (atlas_size, atlas_size), (0, 0, 0, 0))
    for frame, (x, y) in zip(frames, positions):
        atlas_image.paste(frame["image"], (x, y))
        frame_data[frame["name"]]["frame"] = {
            "x": x,
            "y": y,
            "w": frame["width"],
            "h": frame["height"]
        }

    # Save the atlas image
    atlas_filename = f'{atlas_name}_atlas.png'
    atlas_image_path = f'{output_dir}/{atlas_filename}'
    atlas_image.save(atlas_image_path, 'PNG')

    # Create the atlas JSON
    atlas_json = {
        "frames": frame_data,
        "meta": {
            "image": atlas_filename,
            "size": {"w": atlas_size, "h": atlas_size},
            "scale": "1"
        }
    }

    return atlas_image_path, atlas_json

def pack_frames(frames, size):
    """Pack frames into a square using a simple but more efficient algorithm."""
    positions = []
    spaces = [(0, 0, size, size)]  # Available spaces: (x, y, width, height)

    for frame in frames:
        for i, (space_x, space_y, space_w, space_h) in enumerate(spaces):
            if frame["width"] <= space_w and frame["height"] <= space_h:
                positions.append((space_x, space_y))
                
                # Update available spaces
                if space_h - frame["height"] > space_w - frame["width"]:
                    # Split horizontally
                    spaces[i] = (space_x, space_y + frame["height"], space_w, space_h - frame["height"])
                    if frame["width"] < space_w:
                        spaces.append((space_x + frame["width"], space_y, space_w - frame["width"], frame["height"]))
                else:
                    # Split vertically
                    spaces[i] = (space_x + frame["width"], space_y, space_w - frame["width"], space_h)
                    if frame["height"] < space_h:
                        spaces.append((space_x, space_y + frame["height"], frame["width"], space_h - frame["height"]))
                
                break
        else:
            return None  # Couldn't fit all frames

    return positions