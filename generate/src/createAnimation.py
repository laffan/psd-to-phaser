from PIL import Image

def create_animation(group):
    frames = []
    
    # First, calculate the bounding box for the entire animation
    left = min(layer.left for layer in group)
    top = min(layer.top for layer in group)
    right = max(layer.right for layer in group)
    bottom = max(layer.bottom for layer in group)
    
    width = right - left
    height = bottom - top

    # Validate layer names and create frames
    for layer in sorted(group, key=lambda x: int(x.name)):
        try:
            int(layer.name)
        except ValueError:
            raise ValueError(f"Layer name '{layer.name}' in animation group '{group.name}' is not a valid integer.")

        # Create a new blank frame with the full animation dimensions
        frame = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        
        # Composite the layer onto the frame at its correct position
        layer_image = layer.composite()
        frame.paste(layer_image, (layer.left - left, layer.top - top), layer_image)
        
        frames.append(frame)

    return frames, width, height