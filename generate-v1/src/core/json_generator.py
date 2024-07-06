""" src/core/json_generator.py
Generates the final JSON output from processed PSD data.

This module takes the processed data from PSDProcessor and creates
a structured JSON output according to the specified format.

Parameters:
  config (dict) = Configuration dictionary
  processed_data (dict) = Dictionary containing all processed PSD information

Returns:
  None. Writes the JSON output to a file specified in the config.
"""

import json
import os

class JSONGenerator:
    def __init__(self, config, processed_data):
        self.config = config
        self.processed_data = processed_data

    def generate_json(self):
        output_dir = self.config['output_dir']
        
        for psd_name, psd_data in self.processed_data.items():
            psd_output_dir = os.path.join(output_dir, psd_name)
            os.makedirs(psd_output_dir, exist_ok=True)
            
            output_file = os.path.join(psd_output_dir, "data.json")
            with open(output_file, 'w') as f:
                json.dump(psd_data, f, indent=2)
        
        print(f"JSON files generated in {output_dir}")