""" main.py

This script orchestrates the entire process of converting PSD files to JSON and image assets.
It reads the configuration, processes each PSD file, and generates the output.

Parameters:
  config_path (str) = Path to the configuration file (default: 'config.json')

Returns:
  None. Outputs are saved to the specified directory in the config file.
"""

import json
import os
from src.core.psd_processor import PSDProcessor
from src.core.json_generator import JSONGenerator

def main(config_path='config.json'):
    # Load configuration
    with open(config_path, 'r') as config_file:
        config = json.load(config_file)
    
    # Ensure output directory exists
    os.makedirs(config['output_dir'], exist_ok=True)
    
    # Process PSD files
    processor = PSDProcessor(config)
    processed_data = processor.process_all_psds()
    
    # Generate JSON output
    generator = JSONGenerator(config, processed_data)
    generator.generate_json()

if __name__ == "__main__":
    main()