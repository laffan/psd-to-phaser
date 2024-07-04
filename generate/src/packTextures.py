from PIL import Image
from src.texturePacker.packer import Packer, PackingRectangle

class AtlasRect(PackingRectangle):
    def __init__(self, image, name, original_left, original_top):
        super().__init__()
        self.image = image
        self.name = name
        self.size = image.size
        self.original_left = original_left
        self.original_top = original_top

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
    
    :param images: List of tuples (name, PIL.Image, original_left, original_top)
    :param atlas_left: Left position of the atlas group in the PSD
    :param atlas_top: Top position of the atlas group in the PSD
    :return: Tuple (atlas_image, atlas_data)
    """
    rects = [AtlasRect(img, name, left, top) for name, img, left, top in images]
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
        "frames": {},
        "meta": {
            "image": f"{atlas_left}_{atlas_top}.png",
            "size": {"w": max_width, "h": max_height},
            "scale": "1"
        }
    }

    for rect in packed_rects:
        atlas_data["frames"][rect.name] = {
            "frame": {
                "x": rect.left,
                "y": rect.top,
                "w": rect.size[0],
                "h": rect.size[1]
            },
            "relative": {
                "x": rect.original_left - atlas_left,
                "y": rect.original_top - atlas_top
            },
            "absolute": {
                "x": rect.original_left,
                "y": rect.original_top
            }
        }

    return atlas_image, atlas_data