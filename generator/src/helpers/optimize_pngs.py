"""
Optimizes PNG files to reduce file size and cleans up temporary files.

This function can handle both individual PNG files and directories containing PNGs.

Parameters:
  path (str): Path to the PNG file or directory containing PNG files to optimize
  config (dict): Configuration options including PNG optimization settings

Returns:
  None. Optimized PNGs replace the original files in the specified path.
"""

import os
import subprocess

def optimize_pngs(path, config):
    print(f"Optimizing PNGs in: {path}")

    quality_range = config.get('pngQualityRange', {'low': 45, 'high': 65})
    low = quality_range.get('low', 45)
    high = quality_range.get('high', 65)

    def optimize_file(filepath):
        try:
            subprocess.run([
                'pngquant',
                '--quality', f"{low}-{high}",
                '--speed', '1',
                '--force',
                '--ext', '.png',
                '--verbose',
                filepath
            ], check=True, capture_output=True, text=True)
            print(f"Optimized: {filepath}")
        except subprocess.CalledProcessError as e:
            print(f"Error processing {filepath}: {e.stdout}")
        except Exception as e:
            print(f"Error processing {filepath}: {str(e)}")

    if os.path.isfile(path) and path.lower().endswith('.png'):
        optimize_file(path)
    elif os.path.isdir(path):
        for root, dirs, files in os.walk(path):
            for file in files:
                if file.lower().endswith('.png'):
                    filepath = os.path.join(root, file)
                    optimize_file(filepath)

    print("Optimization process completed.")
