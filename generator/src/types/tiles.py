import os
from PIL import Image
from src.helpers.parsers import parse_attributes
from src.helpers.optimize_pngs import optimize_pngs

class Tiles:
    def __init__(self, config, output_dir):
        self.config = config
        self.output_dir = output_dir
        self.tile_slice_size = config.get('tile_slice_size', 512)
        self.tile_scaled_versions = config.get('tile_scaled_versions', [])
        self.jpg_quality = config.get('jpgQuality', 85)
        self.optimize_config = {'pngQualityRange': config.get('pngQualityRange', {'low': 45, 'high': 65})}

    def process_tiles(self, layer):
        print(f"Processing tiles layer: {layer.name}")

        # Unpack the bbox tuple
        x1, y1, x2, y2 = layer.bbox

        tiles_data = {
            "x": x1,
            "y": y1,
            "width": x2 - x1,
            "height": y2 - y1,
        }

        tiles_output_dir = os.path.join(self.output_dir, 'tiles')
        os.makedirs(tiles_output_dir, exist_ok=True)

        tile_info = self._process_tile_layer(layer, tiles_output_dir)
        if tile_info:
            tiles_data.update(tile_info)

        return tiles_data

    def _process_tile_layer(self, layer, tiles_output_dir):
        print(f"Processing tile layer: {layer.name}")

        parsed_data = parse_attributes(layer.name)
        
        if isinstance(parsed_data, dict):
            name = parsed_data.get('name', layer.name)
            tile_type = parsed_data.get('type', '')
            attributes = {k: v for k, v in parsed_data.items() if k not in ['name', 'type']}
        else:
            name = parsed_data if parsed_data else layer.name
            tile_type = ''
            attributes = {}

        if not name:
            print(f"Warning: Unable to determine name for layer {layer.name}. Skipping.")
            return None

        is_jpg = tile_type.lower() == "jpg"
        tile_image = layer.composite()
        
        # Crop the image using the bbox
        x1, y1, x2, y2 = layer.bbox
        tile_image = tile_image.crop((0, 0, x2 - x1, y2 - y1))
        
        tile_info = self._create_tiles(tile_image, tiles_output_dir, name, is_jpg)

        result = {
            "name": name,
            "category": "tileset",
            **attributes,
            **tile_info
        }

        if tile_type:
            result["type"] = tile_type

        return result

    def _create_tiles(self, image, output_dir, image_name, is_jpg):
        if image_name is None:
            print("Warning: image_name is None. Using 'unnamed_tile' as default.")
            image_name = 'unnamed_tile'

        width, height = image.size

        print(f"Processing tile set: {image_name}")
        print(f"Image mode: {image.mode}, size: {image.size}")

        num_tiles_x = (width + self.tile_slice_size - 1) // self.tile_slice_size
        num_tiles_y = (height + self.tile_slice_size - 1) // self.tile_slice_size

        tiles_dir = os.path.join(output_dir, image_name, str(self.tile_slice_size))
        os.makedirs(tiles_dir, exist_ok=True)

        print(f"Slicing {image_name} image into {self.tile_slice_size}px tiles...")

        self._slice_and_save_tiles(image, tiles_dir, image_name, num_tiles_x, num_tiles_y, not is_jpg)

        if self.tile_scaled_versions:
            for size in self.tile_scaled_versions:
                self._create_scaled_tiles(tiles_dir, output_dir, image_name, num_tiles_x, num_tiles_y, size, not is_jpg)

        print(f"Finished processing {image_name}")

        return {
            "columns": num_tiles_x,
            "rows": num_tiles_y,
            "filetype": "jpg" if is_jpg else "png"
        }

    def _slice_and_save_tiles(self, image, tiles_dir, image_name, num_tiles_x, num_tiles_y, use_png):
        for y in range(num_tiles_y):
            for x in range(num_tiles_x):
                left = x * self.tile_slice_size
                top = y * self.tile_slice_size
                right = min(left + self.tile_slice_size, image.width)
                bottom = min(top + self.tile_slice_size, image.height)

                tile = image.crop((left, top, right, bottom))
                if use_png:
                    tile_filename = f"{image_name}_tile_{x}_{y}.png"
                    tile.save(os.path.join(tiles_dir, tile_filename), 'PNG')
                else:
                    tile_filename = f"{image_name}_tile_{x}_{y}.jpg"
                    if tile.mode == 'RGBA':
                        tile = tile.convert('RGB')
                    tile.save(os.path.join(tiles_dir, tile_filename), 'JPEG', quality=self.jpg_quality)

        if use_png:
            optimize_pngs(tiles_dir, self.optimize_config)

    def _create_scaled_tiles(self, tiles_dir, output_dir, image_name, num_tiles_x, num_tiles_y, size, use_png):
        print(f"Creating scaled version at {size}px ...")
        scaled_dir = os.path.join(output_dir, image_name, str(size))
        os.makedirs(scaled_dir, exist_ok=True)

        for y in range(num_tiles_y):
            for x in range(num_tiles_x):
                ext = 'png' if use_png else 'jpg'
                tile_filename = f"{image_name}_tile_{x}_{y}.{ext}"
                tile_path = os.path.join(tiles_dir, tile_filename)
                scaled_tile_path = os.path.join(scaled_dir, tile_filename)

                tile = Image.open(tile_path)
                scaled_tile = tile.resize((size, size), Image.LANCZOS)
                if use_png:
                    scaled_tile.save(scaled_tile_path, 'PNG')
                else:
                    if scaled_tile.mode == 'RGBA':
                        scaled_tile = scaled_tile.convert('RGB')
                    scaled_tile.save(scaled_tile_path, 'JPEG', quality=self.jpg_quality)

        if use_png:
            optimize_pngs(scaled_dir, self.optimize_config)