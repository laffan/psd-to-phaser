import os
from PIL import Image
from src.create_tiles import create_tiles
from src.parsers import parse_attributes

Image.MAX_IMAGE_PIXELS = None  # Disable the DecompressionBombWarning

def extract_tiles(tiles_group, output_dir, slice_size, scaled, psd, jpgQuality):
    print("Processing tiles layer group...")

    # Calculate number of rows and columns based on the PSD size
    columns = (psd.width + slice_size - 1) // slice_size
    rows = (psd.height + slice_size - 1) // slice_size

    tiles_data = {
        "tile_slice_size": slice_size,
        "tile_scaled_versions": scaled,
        "columns": columns,
        "rows": rows,
        "layers": []
    }

    for layer in tiles_group:
        if layer.is_group():
            print(f"Composing {layer.name} layer group...")

            # Parse the layer name and attributes
            name_type_dict, attributes = parse_attributes(layer.name)

            # Compose the layer group
            tile_image = layer.composite()

            # Debug bbox
            print(psd.bbox)

            # Crop the tile image to the size of the PSD canvas
            print(f"Cropping {name_type_dict['name']} layer group...")
            
            tile_image = tile_image.crop((0 - layer.bbox[0], 0 - layer.bbox[1], psd.width - layer.bbox[0], psd.height - layer.bbox[1]))
    
            # Determine if the layer should be exported as transparent based on the type
            is_transparent = name_type_dict.get("type") == "transparent"

            # Save the image as PNG or JPG based on the type
            print(f"Saving {name_type_dict['name']} layer group...")
            if is_transparent:
                image_path = os.path.join(output_dir, f'{name_type_dict["name"]}.png')
                tile_image.save(image_path, 'PNG')
                print(f'Exported {name_type_dict["name"]} layer group as {name_type_dict["name"]}.png')
            else:
                if tile_image.mode == 'RGBA':
                    tile_image = tile_image.convert('RGB')
                image_path = os.path.join(output_dir, f'{name_type_dict["name"]}.jpg')
                tile_image.save(image_path, 'JPEG', quality=jpgQuality)
                print(f'Exported {name_type_dict["name"]} layer group as {name_type_dict["name"]}.jpg')

            # Generate tiles for the exported image
            create_tiles(tile_image, os.path.join(output_dir, 'tiles'), name_type_dict["name"], slice_size, scaled, is_transparent, jpgQuality)

            # Remove the full-size export
            os.remove(image_path)
            print(f'Removed full-size export: {image_path}')

            # Store the tile information
            tile_info = {
                **name_type_dict,
                **attributes
            }
            tiles_data["layers"].append(tile_info)

    return tiles_data