import os
from PIL import Image
from psd_tools import PSDImage
from src.helpers.optimize_pngs import optimize_pngs

class Sprite:
    def __init__(self, layer_info, layer, config, output_dir, psd_name):
        self.layer_info = layer_info
        self.layer = layer
        self.config = config
        self.psd_name = psd_name
        self.output_dir = os.path.join(output_dir, psd_name)
        self.sprite_output_dir = os.path.join(self.output_dir, 'sprites')
        os.makedirs(self.sprite_output_dir, exist_ok=True)

    def process(self):
        """
        Process the sprite. This method should be overridden by subclasses.
        """
        raise NotImplementedError("Subclasses must implement process method")

    def export_image(self, image, filename):
        """
        Export the image to a file.
        """
        filepath = os.path.join(self.sprite_output_dir, filename)
        image.save(filepath, 'PNG')
        return os.path.relpath(filepath, self.output_dir)

    @staticmethod
    def create_sprite(layer_info, layer, config, output_dir, psd_name):
        """
        Factory method to create the appropriate sprite subclass.
        """
        from src.types.sprite_types.basic import BasicSprite
        from src.types.sprite_types.spritesheet import SpritesheetSprite
        from src.types.sprite_types.animation import AnimationSprite
        from src.types.sprite_types.atlas import AtlasSprite

        sprite_type = layer_info.get('type', 'basic')
        
        if sprite_type == 'spritesheet':
            return SpritesheetSprite(layer_info, layer, config, output_dir, psd_name)
        elif sprite_type == 'animation':
            return AnimationSprite(layer_info, layer, config, output_dir, psd_name)
        elif sprite_type == 'atlas':
            return AtlasSprite(layer_info, layer, config, output_dir, psd_name)
        else:
            return BasicSprite(layer_info, layer, config, output_dir, psd_name)
