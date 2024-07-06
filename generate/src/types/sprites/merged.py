import os
from src.types.sprites.base_sprite import BaseSprite
from PIL import Image
from src.helpers.optimize_pngs import optimize_pngs

class MergedSprite(BaseSprite):
    def process(self):
        # Merge all child layers recursively
        merged_image = self._merge_layers(self.layer)
        
        # Save the merged image
        self._save_image(merged_image)
        
        # Generate and return sprite data
        sprite_data = self._generate_base_sprite_data()
        
        # Remove the 'children' key if it exists
        sprite_data.pop('children', None)
        
        return sprite_data

    def _merge_layers(self, layer):
        if layer.is_group():
            # Create a new blank image with the size of the group
            merged = Image.new('RGBA', (layer.width, layer.height), (0, 0, 0, 0))
            
            # Iterate through all layers in the group
            for child in layer:
                # Recursively merge child layers
                child_image = self._merge_layers(child)
                
                # Paste the child image onto the merged image
                merged.paste(child_image, (child.left - layer.left, child.top - layer.top), child_image)
            
            return merged
        else:
            # If it's not a group, just return the layer's image
            return layer.composite()

    def _save_image(self, image):
        # Ensure the output directory exists
        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)
        
        # Save the image
        image.save(self.output_path, 'PNG')
        
        # Optimize the PNG
        optimize_pngs(self.output_path, self.config.get('optimizePNGs', {}))

    def _process_children(self):
        # Override this method to do nothing for merged sprites
        return None