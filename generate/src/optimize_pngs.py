import os
import subprocess

def optimize_pngs(directory, optimize_config):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith('.png'):
                filepath = os.path.join(root, file)
                
                # Determine the type of PNG file
                if 'sprites' in root and optimize_config.get('sprites', True):
                    optimize_file = True
                elif 'tiles' in root and optimize_config.get('tiles', False):
                    optimize_file = True
                elif root == directory and optimize_config.get('renders', False):
                    optimize_file = True
                else:
                    optimize_file = False

                if optimize_file:
                    temp_filepath = os.path.join(root, f"temp-{file}")
                    
                    # Copy original image to temporary image
                    subprocess.run(f"cp {filepath} {temp_filepath}", shell=True)
                    
                    # Optimize the temporary image
                    subprocess.run(f"optipng -o7 -nc -strip all {temp_filepath}", shell=True)
                    subprocess.run(f"pngquant --quality=65-80 --ext .png --force {temp_filepath}", shell=True)
                    
                    # Move optimized temporary image back to original filepath
                    subprocess.run(f"mv {temp_filepath} {filepath}", shell=True)
                    
                    print(f"Optimized: {filepath}")