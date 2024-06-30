import os
import json
from datetime import datetime
from src.optimize_pngs import optimize_pngs
from src.process_psd import process_psd

# Load the configuration variables from config.json
with open('config.json', 'r') as config_file:
    config = json.load(config_file)

# Extract the configuration variables
psd_dir = config['psd_dir']
output_dir = config['output_dir']
slice_size = config['tile_slice_size']
scaled = config['tile_scaled_versions']
optimizePNGs = config.get('optimizePNGs', {"sprites": True, "tiles": False, "renders": False})

# Initialize the site_data dictionary
site_data = {
    "generatedTimestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "slice_size": slice_size,
    "sizes": scaled,
    "psds": []
}

# Loop through the PSD files in the input directory
for filename in os.listdir(psd_dir):
    if filename.endswith('.psd'):
        # Extract the PSD file name without the extension
        psd_file = os.path.splitext(filename)[0]
        
        print(f"Processing PSD file: {psd_file}")
        
        # Create a new directory for the PSD file within the output_dir
        psd_output_dir = os.path.join(output_dir, psd_file)
        os.makedirs(psd_output_dir, exist_ok=True)
        
        # Process the PSD file
        psd_path = os.path.join(psd_dir, filename)
        psd_data = process_psd(psd_path, psd_output_dir, slice_size, scaled)
        
        # Append the PSD data to the psds array in site_data
        site_data["psds"].append(psd_data)

# Save the site_data as site_data.json in the output directory
site_data_path = os.path.join(output_dir, 'site_data.json')
with open(site_data_path, 'w') as file:
    json.dump(site_data, file, indent=2)

print("All PSD files processed.")
print(f"site_data.json generated at: {site_data_path}")

if any(optimizePNGs.values()):
    print("Optimizing PNG files...")
    optimize_pngs(output_dir, optimizePNGs)
    print("PNG optimization completed.")