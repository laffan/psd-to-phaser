import os
import subprocess
import json

def optimize_pngs(directory, optimize_config):
    print(f"Optimizing PNGs in directory: {directory}")
    print(f"Optimization config: {optimize_config}")

    # Load the main JSON data file
    json_filepath = os.path.join(directory, 'data.json')
    if not os.path.exists(json_filepath):
        print(f"Error: data.json not found in {directory}")
        return

    with open(json_filepath, 'r') as json_file:
        data = json.load(json_file)

    def should_compress_file(filename, data):
        """Recursively search for the file in the JSON data and check if it should be compressed."""
        if isinstance(data, dict):
            if 'name' in data and data['name'] + '.png' == filename:
                return data.get('compress', False)
            for value in data.values():
                result = should_compress_file(filename, value)
                if result is not None:
                    return result
        elif isinstance(data, list):
            for item in data:
                result = should_compress_file(filename, item)
                if result is not None:
                    return result
        return None

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith('.png'):
                filepath = os.path.join(root, file)
                relative_path = os.path.relpath(filepath, directory)
                
                
                # Determine if we should compress this file
                should_compress = False
                
                if 'sprites' in relative_path and optimize_config.get('forceAllSprites', False):
                    should_compress = True
                    print("Compression triggered by forceAllSprites")
                elif 'tiles' in relative_path and optimize_config.get('forceAllTiles', False):
                    should_compress = True
                    print("Compression triggered by forceAllTiles")
                else:
                    compress_flag = should_compress_file(file, data)
                    if compress_flag:
                        should_compress = True
                        print(f"Compression triggered for {file} based on JSON data")
                
                if should_compress:
                    temp_filepath = os.path.join(root, f"temp-{file}")
                        
                    # Copy original image to temporary image
                    subprocess.run(f"cp {filepath} {temp_filepath}", shell=True)

                    # pngquant parameters:
                    # --quality=45-65: allow quality to fall as low as 45% but don't exceed 65%
                    # --speed=1: use the slowest speed (1-11, 1 is slowest but highest quality)

                    subprocess.run(f"pngquant --quality=45-65 --speed=1 --ext .png --force {temp_filepath}", shell=True)

                    # Move optimized temporary image back to original filepath
                    subprocess.run(f"mv {temp_filepath} {filepath}", shell=True)


                    print(f"Optimized: {filepath}")

    print("Optimization process completed.")