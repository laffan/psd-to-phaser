#!/usr/bin/env python3
"""
PSD Generation Script for PSD-to-Phaser Documentation Demos

This script creates PSD files from the existing data.json and sprite files
in the demos/output folder. The generated PSDs can be used to verify that
psd-to-json produces the correct output.

Usage:
    python generate_psds.py [demo_name]

    If demo_name is provided, only that demo's PSD will be generated.
    Otherwise, all missing demo PSDs will be generated.

Dependencies:
    pip install psd-tools pillow
"""

import json
import os
import sys
from pathlib import Path
from PIL import Image

try:
    from psd_tools import PSDImage
    from psd_tools.constants import BlendMode
except ImportError:
    print("Error: psd-tools is required. Install with: pip install psd-tools")
    sys.exit(1)

# Map of demo folders that need PSDs generated
DEMO_FOLDERS = [
    "button",
    "parallax",
    "panTo",
    "fillZone",
    "joystick"
]

# Category prefixes for psd-to-json layer naming convention
CATEGORY_PREFIX = {
    "sprite": "S",
    "group": "G",
    "zone": "Z",
    "point": "P",
    "tile": "T"
}


def get_layer_name(layer_data):
    """
    Generate a PSD layer name following the psd-to-json naming convention.
    Format: CATEGORY | name | type | attributes
    """
    category = layer_data.get("category", "sprite")
    name = layer_data.get("name", "unnamed")
    prefix = CATEGORY_PREFIX.get(category, "S")

    parts = [prefix, name]

    # Add type if present
    layer_type = layer_data.get("type")
    if layer_type:
        parts.append(layer_type)

    # Add attributes if present and non-empty
    attributes = layer_data.get("attributes", {})
    if attributes:
        attr_str = ", ".join(f"{k}: {v}" for k, v in attributes.items())
        parts.append(attr_str)

    return " | ".join(parts)


def load_sprite_image(output_path, layer_data, canvas_size):
    """Load a sprite image or create a placeholder for zones."""
    category = layer_data.get("category", "sprite")

    if category == "zone":
        # Zones don't have images, create a transparent layer
        # The zone dimensions come from bbox or width/height
        bbox = layer_data.get("bbox", {})
        if bbox:
            width = bbox.get("right", 0) - bbox.get("left", 0)
            height = bbox.get("bottom", 0) - bbox.get("top", 0)
        else:
            width = layer_data.get("width", 100)
            height = layer_data.get("height", 100)

        # Create a semi-transparent rectangle for visualization
        img = Image.new("RGBA", (width, height), (255, 0, 0, 50))
        return img

    # For sprites, load the actual image file
    file_path = layer_data.get("filePath")
    if not file_path:
        # Create placeholder
        width = layer_data.get("width", 100)
        height = layer_data.get("height", 100)
        return Image.new("RGBA", (width, height), (128, 128, 128, 255))

    full_path = output_path / file_path
    if full_path.exists():
        img = Image.open(full_path)
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        return img
    else:
        print(f"  Warning: Image not found: {full_path}")
        width = layer_data.get("width", 100)
        height = layer_data.get("height", 100)
        return Image.new("RGBA", (width, height), (128, 128, 128, 255))


def create_pixel_layer_for_group(psd, layer_data, output_path, canvas_size):
    """Create a pixel layer that can be added to a group."""
    name = get_layer_name(layer_data)
    x = layer_data.get("x", 0)
    y = layer_data.get("y", 0)

    # Load the image for this layer
    img = load_sprite_image(output_path, layer_data, canvas_size)

    # Create pixel layer on the PSD first
    layer = psd.create_pixel_layer(
        image=img,
        name=name,
        left=x,
        top=y
    )

    return layer


def process_layer(psd, parent_group, layer_data, output_path, canvas_size):
    """Process a single layer and add it to the PSD or parent group."""
    category = layer_data.get("category", "sprite")
    name = get_layer_name(layer_data)
    x = layer_data.get("x", 0)
    y = layer_data.get("y", 0)

    if category == "group":
        # First, create all child layers
        children = layer_data.get("children", [])
        child_layers = []

        for child in children:
            child_layer = process_layer(psd, None, child, output_path, canvas_size)
            child_layers.append(child_layer)

        # Create a group with the child layers
        group = psd.create_group(layer_list=child_layers, name=name)

        # If we have a parent group, move this group into it
        if parent_group is not None:
            parent_group.append(group)

        return group
    else:
        # Load the image for this layer
        img = load_sprite_image(output_path, layer_data, canvas_size)

        # Create pixel layer
        layer = psd.create_pixel_layer(
            image=img,
            name=name,
            left=x,
            top=y
        )

        # If we have a parent group, move this layer into it
        if parent_group is not None:
            parent_group.append(layer)

        return layer


def generate_psd(demo_name, output_dir, psds_dir):
    """Generate a PSD file for a single demo."""
    output_path = output_dir / demo_name
    data_path = output_path / "data.json"
    psd_path = psds_dir / f"{demo_name}.psd"

    if not data_path.exists():
        print(f"  Skipping {demo_name}: data.json not found")
        return False

    print(f"  Generating {demo_name}.psd...")

    # Load the data.json
    with open(data_path) as f:
        data = json.load(f)

    width = data.get("width", 300)
    height = data.get("height", 300)
    canvas_size = (width, height)

    # Create new PSD
    psd = PSDImage.new("RGBA", canvas_size)

    # Process layers in reverse order (bottom to top in PSD layer stack)
    layers = data.get("layers", [])
    for layer_data in reversed(layers):
        process_layer(psd, None, layer_data, output_path, canvas_size)

    # Save the PSD
    psd.save(str(psd_path))
    print(f"    Saved: {psd_path}")

    return True


def main():
    """Main entry point."""
    # Determine paths relative to this script's location
    script_dir = Path(__file__).parent
    psds_dir = script_dir
    output_dir = script_dir.parent / "output"

    print("PSD Generation Script for PSD-to-Phaser Demos")
    print("=" * 50)
    print(f"Output directory: {output_dir}")
    print(f"PSDs directory: {psds_dir}")
    print()

    # Check if a specific demo was requested
    if len(sys.argv) > 1:
        demo_names = sys.argv[1:]
    else:
        demo_names = DEMO_FOLDERS

    generated = 0
    for demo_name in demo_names:
        if generate_psd(demo_name, output_dir, psds_dir):
            generated += 1

    print()
    print(f"Generated {generated} PSD file(s)")

    if generated > 0:
        print()
        print("Next steps:")
        print("  1. Open the generated PSDs in Photoshop to verify layer structure")
        print("  2. Run psd-to-json on the PSDs to verify round-trip compatibility")
        print("  3. Compare output with original data.json files")


if __name__ == "__main__":
    main()
