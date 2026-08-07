import os
import math
from PIL import Image, ImageDraw

src_path = r"C:\Users\Rubel\.gemini\antigravity-ide\brain\b4d34bd0-bb1a-4b05-8f56-254d74b5485a\media__1786115556730.jpg"
public_dir = r"d:\memelaunch\public"
app_dir = r"d:\memelaunch\app"

# 1. Open source image
img = Image.open(src_path).convert("RGBA")
width, height = img.size
print(f"Favicon source loaded: {width}x{height}")

# 2. Process circular transparency / black removal
# The image has an orange circular border. We can make outside black transparent.
pixels = img.load()
cx, cy = width / 2.0, height / 2.0
max_radius = min(width, height) / 2.0 - 2.0  # slight inset for crisp anti-aliasing

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        dist = math.hypot(x - cx, y - cy)
        max_val = max(r, g, b)

        # If outside the circle or pure black background
        if dist > max_radius:
            pixels[x, y] = (0, 0, 0, 0)
        elif dist > max_radius - 3.0:
            # Smooth edge feathering
            edge_ratio = (max_radius - dist) / 3.0
            new_a = int(255 * max(0.0, min(1.0, edge_ratio)))
            pixels[x, y] = (r, g, b, new_a)
        elif max_val < 15 and dist > (max_radius * 0.9):
            # Outer black pixels
            pixels[x, y] = (0, 0, 0, 0)

# 3. Create different favicon sizes
# a. 32x32 for standard favicon.ico
fav_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
fav_32.save(os.path.join(public_dir, "favicon.png"), "PNG")
fav_32.save(os.path.join(public_dir, "favicon.ico"), format="ICO")
fav_32.save(os.path.join(app_dir, "favicon.ico"), format="ICO")
print("Saved 32x32 favicon.ico and favicon.png")

# b. 192x192 for high-res PWA icon / browser tab
icon_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
icon_192.save(os.path.join(public_dir, "icon.png"), "PNG")
icon_192.save(os.path.join(app_dir, "icon.png"), "PNG")
print("Saved 192x192 icon.png")

# c. 180x180 for Apple Touch Icon
apple_180 = img.resize((180, 180), Image.Resampling.LANCZOS)
apple_180.save(os.path.join(public_dir, "apple-icon.png"), "PNG")
apple_180.save(os.path.join(app_dir, "apple-icon.png"), "PNG")
print("Saved 180x180 apple-icon.png")

print("🎉 All favicons generated successfully!")
