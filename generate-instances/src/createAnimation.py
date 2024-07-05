from PIL import Image

def create_animation(group):
    frames = []
    
    # First, calculate the bounding box for the entire animation
    left = min(layer.left for layer in group.descendants())
    top = min(layer.top for layer in group.descendants())
    right = max(layer.right for layer in group.descendants())
    bottom = max(layer.bottom for layer in group.descendants())
    
    width = right - left
    height = bottom - top

    def process_layer(layer):
        if layer.is_group():
            # For groups, composite all child layers
            frame = layer.composite()
        else:
            # For individual layers, just use the layer itself
            frame = layer.composite()
        
        # Ensure the frame is positioned correctly within the animation bounds
        full_frame = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        full_frame.paste(frame, (layer.left - left, layer.top - top), frame)
        return full_frame

    # Process all immediate children of the animation group
    for item in sorted(group, key=lambda x: x.name):
        try:
            # Attempt to use the layer name as a frame number
            int(item.name)
            frame = process_layer(item)
            frames.append(frame)
        except ValueError:
            print(f"Warning: Layer or group name '{item.name}' in animation group '{group.name}' is not a valid integer. Skipping this frame.")

    if not frames:
        raise ValueError(f"No valid frames found in animation group '{group.name}'")

    return frames, width, height