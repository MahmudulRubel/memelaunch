import os
from PIL import Image

src_path = r"C:\Users\Rubel\.gemini\antigravity-ide\brain\b4d34bd0-bb1a-4b05-8f56-254d74b5485a\media__1786113610678.png"
public_dir = r"d:\memelaunch\public"

os.makedirs(public_dir, exist_ok=True)

# 1. Open image
img = Image.open(src_path).convert("RGBA")
width, height = img.size
print(f"Image loaded: {width}x{height}")

# Save raw original
raw_dest = os.path.join(public_dir, "logo-raw.png")
img.save(raw_dest)
print(f"Saved raw logo to {raw_dest}")

# 2. Perform background removal (black to transparent)
pixels = img.load()

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        # Check black threshold
        max_val = max(r, g, b)
        if max_val < 20:
            # Fully transparent
            pixels[x, y] = (0, 0, 0, 0)
        elif max_val < 50:
            # Smooth edge anti-aliasing alpha blend
            alpha_ratio = (max_val - 20) / 30.0
            new_a = int(a * alpha_ratio)
            pixels[x, y] = (r, g, b, new_a)

transparent_dest = os.path.join(public_dir, "logo.png")
img.save(transparent_dest, "PNG")
print(f"Saved transparent logo to {transparent_dest}")

# 3. Create rocket icon standalone crop
# Rocket is located in the left half of the image
icon_crop = img.crop((0, 0, int(width * 0.45), height))
# Bounding box crop
bbox = icon_crop.getbbox()
if bbox:
    icon_crop = icon_crop.crop(bbox)

icon_dest = os.path.join(public_dir, "logo-icon.png")
icon_crop.save(icon_dest, "PNG")
print(f"Saved standalone rocket icon to {icon_dest}")
