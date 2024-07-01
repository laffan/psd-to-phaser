import os
import json
from datetime import datetime
from src.optimize_pngs import optimize_pngs
from src.process_psd import process_psd

# Load the configuration variables from config.json
with open('config.json', 'r') as config_file:
    config = json.load(config_file)

# Extract the configuration variables
input_dir = config['input_dir']
output_dir = config['output_dir']
psds = config['psds']
slice_size = config['tile_slice_size']
scaled = config['tile_scaled_versions']
optimizePNGs = config.get('optimizePNGs', {"forceAllSprites": False, "forceAllTiles": False})

# Process the specified PSD files
for psd_path in psds:
    # Construct the full input path
    full_input_path = os.path.join(input_dir, psd_path)
    
    if not os.path.exists(full_input_path):
        print(f"Error: PSD file not found: {full_input_path}")
        continue
    
    # Extract the PSD file name and directory structure
    psd_relative_dir, psd_filename = os.path.split(psd_path)
    psd_name = os.path.splitext(psd_filename)[0]
    
    print(f"Processing PSD file: {psd_filename}")
    
    # Create the output directory structure
    psd_output_dir = os.path.join(output_dir, psd_relative_dir, psd_name)
    os.makedirs(psd_output_dir, exist_ok=True)
    
    # Process the PSD file
    psd_data = process_psd(full_input_path, psd_output_dir, slice_size, scaled, psd_name)
    
    # Add metadata to the PSD data
    psd_data["generatedTimestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    psd_data["slice_size"] = slice_size
    psd_data["sizes"] = scaled
    
    # Save the JSON data
    with open(os.path.join(psd_output_dir, 'data.json'), 'w') as json_file:
        json.dump(psd_data, json_file, indent=2)
    
    print(f"JSON data for {psd_filename} saved in its output directory")

    # Optimize PNGs for this specific PSD output
    optimize_pngs(psd_output_dir, optimizePNGs)
    print(f"PNG optimization completed for {psd_filename}")

print("All specified PSD files processed.")