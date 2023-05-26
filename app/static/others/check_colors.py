from PIL import Image, ImageDraw, ImageFont
import re
import os
import datetime

# Define the size of the image
width = 200
height = 40

# Define the string of colors
color_string = """
  color(74, 130, 216, 25), color(80, 140, 160, 25), color(255, 255, 255, 25)
"""

# Split the string into individual color values
color_values = re.findall(r'\((.*?)\)', color_string)
print(color_values)

# Create a new image
img = Image.new("RGB", (width, height * len(color_values)), color=(255, 255, 255))

# Set the color and text of each pixel in the image
font = ImageFont.truetype("arial.ttf", 16)
draw = ImageDraw.Draw(img)

for i, c in enumerate(color_values):
    try:
        r, g, b = map(int, re.split(",\s*|\,", c)[:3])
        draw.rectangle((0, i * height, width, (i + 1) * height), fill=(r, g, b))
        text_width, text_height = draw.textsize(f"{r}, {g}, {b}", font=font)
        text_x = width // 2 - text_width // 2
        text_y = (i + 0.5) * height - text_height // 2
        draw.text((text_x, text_y), f"{r}, {g}, {b}", font=font, fill=(0, 0, 0), stroke_width=2, stroke_fill=(255, 255, 255))
    except:
        continue

# Get the directory path of the script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Get the current date and time
now = datetime.datetime.now()

# Generate a filename with the current date and time and the script directory path
filename = f"{script_dir}/image_{now.strftime('%Y-%m-%d_%H-%M-%S')}.jpg"
img.save(filename)
img.show()
