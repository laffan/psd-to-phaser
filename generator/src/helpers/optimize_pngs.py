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

    # quality_range = config.get('pngQualityRange', {'low': 45, 'high': 65})
    print(f"optimize_pngs configuration : {config}")

    def optimize_file(filepath):
        try:
            # Optimize the PNG directly, without creating a separate temp file
            subprocess.run([
                'pngquant',
                '--quality', f"{config['low']}-{config['high']}",
                '--speed', '1',
                '--force',
                '--ext', '.png',
                '--verbose',
                filepath
            ], check=True, capture_output=True, text=True)
            print(f"Optimized: {filepath}")
        except subprocess.CalledProcessError as e:
            print(f"Failed to optimize {filepath}: {e.stdout}")
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

    # Clean up any remaining .temp files
    if os.path.isdir(path):
        for root, dirs, files in os.walk(path):
            for file in files:
                if file.endswith('.temp'):
                    try:
                        os.remove(os.path.join(root, file))
                    except Exception as e:
                        print(f"Failed to remove temporary file {file}: {str(e)}")

    print("Optimization process completed and temporary files cleaned up.")