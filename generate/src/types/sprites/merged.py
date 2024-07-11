import os
from src.types.sprites.base_sprite import BaseSprite
from PIL import Image
from src.helpers.optimize_pngs import optimize_pngs

class MergedSprite(BaseSprite):
    def process(self):
        # Merge all child layers recursively
        merged_image = self._merge_layers(self.layer)
        
        # Apply group opacity if we're not capturing alpha
        if not self.capture_props.get('alpha', False):
            merged_image = self._apply_group_opacity(merged_image, self.layer.opacity)
        
        # Save the merged image
        self._save_image(merged_image)

        # Generate and return sprite data
        sprite_data = self._generate_base_sprite_data()
        
        sprite_data['filePath'] = self._get_relative_path()

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
            # If it's not a group, use _get_composite_image to handle alpha correctly
            return self._get_composite_image(layer)

    def _apply_group_opacity(self, image, opacity):
        if opacity == 255:
            return image
        
        # Create a new image with an alpha channel
        result = Image.new('RGBA', image.size, (0, 0, 0, 0))
        
        # Paste the original image onto the new image, applying the opacity
        mask = Image.new('L', image.size, int(opacity))
        result.paste(image, (0, 0), mask)
        
        return result

    def _save_image(self, image):
        # Ensure the output directory exists
        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)
        
        # Save the image
        image.save(self.output_path, 'PNG')
        
        # Optimize the PNG
        optimize_pngs(self.output_path, self.config.get('pngQualityRange', {}))

    def _process_children(self):
        # Override this method to do nothing for merged sprites
        return None

    def _get_composite_image(self, layer):
        if self.capture_props.get('alpha', False):
            # If we're capturing alpha, export at 100% opacity
            original_opacity = layer.opacity
            layer.opacity = 255
            image = layer.composite()
            layer.opacity = original_opacity
        else:
            # If we're not capturing alpha, export with original opacity
            image = layer.composite()
        return image