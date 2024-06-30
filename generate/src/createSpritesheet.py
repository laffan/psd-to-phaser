import math
import os
from PIL import Image

def create_spritesheet(frames, output_path, frame_width, frame_height):
    frame_count = len(frames)

    # Calculate grid dimensions
    grid_size = math.ceil(math.sqrt(frame_count))
    sheet_width = grid_size * frame_width
    sheet_height = math.ceil(frame_count / grid_size) * frame_height

    # Create spritesheet
    spritesheet = Image.new('RGBA', (sheet_width, sheet_height), (0, 0, 0, 0))

    # Paste frames onto spritesheet
    for index, frame in enumerate(frames):
        x = (index % grid_size) * frame_width
        y = (index // grid_size) * frame_height
        spritesheet.paste(frame, (x, y))

    # Save spritesheet
    spritesheet.save(output_path)

    return {
        "filename": os.path.basename(output_path),
        "frame_width": frame_width,
        "frame_height": frame_height,
        "frame_count": frame_count,
        "columns": grid_size,
        "rows": math.ceil(frame_count / grid_size)
    }