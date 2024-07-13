import os
from PIL import Image
from src.helpers.parsers import parse_attributes
from src.types.tiles.tile_processor import create_tiles

Image.MAX_IMAGE_PIXELS = None  # Disable the DecompressionBombWarning

def extract_tiles(tiles_group, psd_output_dir, config, psd_width, psd_height):
    print("Processing tiles layer group...")

    tile_slice_size = config.get('tile_slice_size', 512)
    tile_scaled_versions = config.get('tile_scaled_versions', [])
    jpgQuality = config.get('jpgQuality', 85)
    optimize_config = config.get('optimizePNGs', {})

    # Calculate number of rows and columns based on the PSD size
    columns = (psd_width + tile_slice_size - 1) // tile_slice_size
    rows = (psd_height + tile_slice_size - 1) // tile_slice_size

    tiles_data = {
        "tile_slice_size": tile_slice_size,
        "tile_scaled_versions": tile_scaled_versions,
        "columns": columns,
        "rows": rows,
        "layers": []
    }

    tiles_output_dir = os.path.join(psd_output_dir, 'tiles')
    os.makedirs(tiles_output_dir, exist_ok=True)

    layer_order_counter = 0

    for layer in tiles_group:
        if layer.is_group():
            print(f"Composing {layer.name} layer group...")

            # Parse the layer name and attributes
            name_type_dict, attributes = parse_attributes(layer.name)

            # Compose the layer group
            tile_image = layer.composite()

            # Calculate the crop box
            left = max(0, layer.left)
            top = max(0, layer.top)
            right = min(psd_width, layer.right)
            bottom = min(psd_height, layer.bottom)

            print(f"Cropping {name_type_dict['name']} layer group to PSD size...")
            cropped_image = Image.new('RGBA', (psd_width, psd_height), (0, 0, 0, 0))
            cropped_image.paste(tile_image, (left, top))
            cropped_image = cropped_image.crop((0, 0, psd_width, psd_height))

            # Save the full composed image
            full_image_path = os.path.join(tiles_output_dir, f"{name_type_dict['name']}_full.png")
            cropped_image.save(full_image_path, 'PNG')
            print(f"Saved full composed image: {full_image_path}")

            # Determine if the layer should be exported as transparent based on the type
            is_transparent = name_type_dict.get("type") == "transparent"

            # Generate tiles for the exported image
            create_tiles(full_image_path,
                         tiles_output_dir,
                         name_type_dict["name"],
                         tile_slice_size,
                         tile_scaled_versions,
                         is_transparent,
                         jpgQuality,
                         optimize_config)

            # Store the tile information
            tile_info = {
                **name_type_dict,
                **attributes,
                "layerOrder": layer_order_counter
            }
            tiles_data["layers"].append(tile_info)
            layer_order_counter += 1

    return tiles_data