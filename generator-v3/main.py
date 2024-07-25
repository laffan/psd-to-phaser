import json
import os
import time
from src.core.psd_processor import PSDProcessor
from src.core.json_generator import JSONGenerator
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Set the logging level to DEBUG to capture all levels of log messages
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',  # Define the log message format
    handlers=[
        logging.StreamHandler()  # Add a StreamHandler to output log messages to the console
    ]
)

def get_file_mtime(filepath):
    try:
        return os.stat(filepath).st_mtime
    except FileNotFoundError:
        return 0

def process_psds(config):
    # Ensure output directory exists
    os.makedirs(config['output_dir'], exist_ok=True)
    print(f"Configuration in main.py/process_psds: {config}")

    # Process PSD files
    processor = PSDProcessor(config)
    processed_data = processor.process_all_psds()
    
    # Generate JSON output
    generator = JSONGenerator(config, processed_data)
    generator.generate_json()

def main(config_path='config.json'):
    # Load configuration
    with open(config_path, 'r') as config_file:
        config = json.load(config_file)

    # Initial processing
    process_psds(config)

    if config.get('generateOnSave', False):
        print("Watching for PSD file changes...")
        last_modified_times = {psd: get_file_mtime(psd) for psd in config['psd_files']}

        try:
            while True:
                changes_detected = False
                for psd in config['psd_files']:
                    current_mtime = get_file_mtime(psd)
                    if current_mtime > last_modified_times[psd]:
                        print(f"Change detected in {psd}")
                        changes_detected = True
                        last_modified_times[psd] = current_mtime

                if changes_detected:
                    process_psds(config)
                    print("Processing complete. Watching for more changes...")

                time.sleep(2)  # Wait for 2 seconds before checking again
        except KeyboardInterrupt:
            print("Stopping file watcher...")

if __name__ == "__main__":
    main()