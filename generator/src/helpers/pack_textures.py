from PIL import Image
from src.helpers.texture_packer.packer import Packer, PackingRectangle

class AtlasRect(PackingRectangle):
    def __init__(self, image, name, original_left, original_top, properties):
        super().__init__()
        self.image = image
        self.name = name
        self.size = image.size
        self.original_left = original_left
        self.original_top = original_top
        self.properties = properties

    def child_get_data(self, x, y):
        if self.position is None or x < self.left or x >= self.right or y < self.top or y >= self.bottom:
            return None
        pixel = self.image.getpixel((x - self.left, y - self.top))
        return list(pixel) if len(pixel) == 4 else list(pixel) + [255]

    def get_title(self):
        return self.name

def pack_textures(images, atlas_left, atlas_top):
    """
    Pack multiple images into a single atlas.

    :param images: List of tuples (name, PIL.Image, original_left, original_top, properties)
    :param atlas_left: Left position of the atlas group in the PSD
    :param atlas_top: Top position of the atlas group in the PSD
    :return: Tuple (atlas_image, atlas_data)
    """
    rects = [AtlasRect(img, name, left, top, props) for name, img, left, top, props in images]
    packer = Packer(rects)
    packed_rects, area = packer.pack()

    # Find the maximum dimensions
    max_width = max(rect.right for rect in packed_rects)
    max_height = max(rect.bottom for rect in packed_rects)

    # Create the atlas image
    atlas_image = Image.new('RGBA', (max_width, max_height), (0, 0, 0, 0))

    # Paste all images into the atlas
    for rect in packed_rects:
        atlas_image.paste(rect.image, (rect.left, rect.top))

    # Create the atlas data
    atlas_data = {
        "frames": [],
        "placement": []
    }

    for rect in packed_rects:
        # Add frame data
        frame_data = {
            "name": rect.name,
            "x": rect.left,
            "y": rect.top,
            "w": rect.size[0],
            "h": rect.size[1],
            "properties": rect.properties  # Include the properties in the frame data
        }
        atlas_data["frames"].append(frame_data)

        # Add placement data
        atlas_data["placement"].append({
            "frame": rect.name,
            "relative": {
                "x": rect.original_left - atlas_left,
                "y": rect.original_top - atlas_top
            },
            "absolute": {
                "x": rect.original_left,
                "y": rect.original_top
            }
        })

    return atlas_image, atlas_data