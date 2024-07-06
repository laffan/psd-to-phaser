""" src/helpers/optimize_pngs.py
Optimizes PNG files to reduce file size.

This module provides functionality to compress PNG files using pngquant,
improving file size while maintaining acceptable image quality.

Parameters:
  directory (str) = Path to the directory containing PNG files to optimize
  optimize_config (dict) = Configuration options for PNG optimization

Returns:
  None. Optimized PNGs replace the original files in the specified directory.
"""

import os
import subprocess

def optimize_pngs(directory, optimize_config):
    print(f"Optimizing PNGs in directory: {directory}")
    print(f"Optimization config: {optimize_config}")

    quality_range = optimize_config.get('pngQualityRange', {'low': 45, 'high': 65})

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith('.png'):
                filepath = os.path.join(root, file)
                temp_filepath = os.path.join(root, f"temp-{file}")
                
                # Copy original image to temporary image
                subprocess.run(f"cp {filepath} {temp_filepath}", shell=True)

                # Optimize the PNG
                subprocess.run(f"pngquant --quality={quality_range['low']}-{quality_range['high']} --speed=1 --ext .png --force {temp_filepath}", shell=True)

                # Move optimized temporary image back to original filepath
                subprocess.run(f"mv {temp_filepath} {filepath}", shell=True)

                print(f"Optimized: {filepath}")

    print("Optimization process completed.")