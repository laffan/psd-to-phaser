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

            print(f"JSON file generated: {output_file}")

        print(f"All JSON files generated in {output_dir}")