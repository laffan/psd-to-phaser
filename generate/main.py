import os
import json
import time
from datetime import datetime
from src.optimize_pngs import optimize_pngs
from src.process_psd import process_psd

def get_file_mtime(filepath):
    try:
        return os.stat(filepath).st_mtime
    except FileNotFoundError:
        return 0

def process_single_psd(psd_path, config, output_dir, slice_size, scaled, optimizePNGs):
    full_input_path = os.path.join(config['input_dir'], psd_path)
    
    if not os.path.exists(full_input_path):
        print(f"Error: PSD file not found: {full_input_path}")
        return
    
    psd_relative_dir, psd_filename = os.path.split(psd_path)
    psd_name = os.path.splitext(psd_filename)[0]
    
    print(f"Processing PSD file: {psd_filename}")
    
    psd_output_dir = os.path.join(output_dir, psd_relative_dir, psd_name)
    os.makedirs(psd_output_dir, exist_ok=True)
    
    psd_data = process_psd(full_input_path, psd_output_dir, slice_size, scaled, psd_name)
    
    psd_data["generatedTimestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    psd_data["slice_size"] = slice_size
    psd_data["sizes"] = scaled
    
    with open(os.path.join(psd_output_dir, 'data.json'), 'w') as json_file:
        json.dump(psd_data, json_file, indent=2)
    
    print(f"JSON data for {psd_filename} saved in its output directory")

    optimize_pngs(psd_output_dir, optimizePNGs)
    print(f"PNG optimization completed for {psd_filename}")

def check_and_process_changes(psds, last_modified_times, config, output_dir, slice_size, scaled, optimizePNGs):
    changes_detected = False
    last_processed_file = None
    for psd in psds:
        full_path = os.path.join(config['input_dir'], psd)
        current_mtime = get_file_mtime(full_path)
        if current_mtime > last_modified_times[psd]:
            print(f"Change detected in {psd}")
            process_single_psd(psd, config, output_dir, slice_size, scaled, optimizePNGs)
            last_modified_times[psd] = current_mtime
            changes_detected = True
            last_processed_file = psd
    return changes_detected, last_processed_file

def main():
    with open('config.json', 'r') as config_file:
        config = json.load(config_file)

    input_dir = config['input_dir']
    output_dir = config['output_dir']
    psds = config['psds']
    slice_size = config['tile_slice_size']
    scaled = config['tile_scaled_versions']
    optimizePNGs = config.get('optimizePNGs', {"forceAllSprites": False, "forceAllTiles": False})
    generate_on_save = config.get('generateOnSave', False)

    # Initial processing of all PSD files
    for psd_path in psds:
        process_single_psd(psd_path, config, output_dir, slice_size, scaled, optimizePNGs)

    if generate_on_save:
        print("---\nWatching for PSD file changes...")
        last_modified_times = {psd: get_file_mtime(os.path.join(input_dir, psd)) for psd in psds}

        try:
            while True:
                changes_detected, last_processed_file = check_and_process_changes(psds, last_modified_times, config, output_dir, slice_size, scaled, optimizePNGs)
                if changes_detected:
                    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    print(f"---\nUpdated {last_processed_file} at {timestamp}\nWatching for PSD file changes...")
                time.sleep(1)  # Wait for 1 second before checking again
        except KeyboardInterrupt:
            print("Stopping file watcher...")

if __name__ == "__main__":
    main()