import os
from PIL import Image, ImageDraw

def make_background_transparent(image_path, output_path):
    # Load image and convert to RGBA
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    
    # We will use flood fill starting from the 4 corners:
    # (0, 0), (width-1, 0), (0, height-1), (width-1, height-1)
    corners = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
    
    # Value to fill with: transparent (0, 0, 0, 0)
    fill_color = (0, 0, 0, 0)
    
    # Run floodfill for each corner. We set a threshold of 10 to catch near-white pixels if compression is lossy.
    for corner in corners:
        # Check if the pixel is already transparent to avoid redundant work
        pixel = img.getpixel(corner)
        if pixel[3] > 0:
            ImageDraw.floodfill(img, corner, fill_color, thresh=15)
            
    # Save the result
    img.save(output_path, "PNG")
    print(f"Successfully processed {image_path} -> {output_path}")

if __name__ == "__main__":
    whatsapp_image = r"C:\Users\P C\Documents\OMRA APP AVEC QWEN\public\WhatsApp Image 2026-07-06 at 11.52.10.jpeg"
    output_logo = r"c:\Users\P C\Documents\OMRA APP AVEC QWEN\public\app-logo.png"
    
    # Run the transparency process with a slightly higher threshold for JPEG compression (thresh=30)
    img = Image.open(whatsapp_image).convert("RGBA")
    width, height = img.size
    corners = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
    fill_color = (0, 0, 0, 0)
    
    for corner in corners:
        pixel = img.getpixel(corner)
        if pixel[3] > 0:
            ImageDraw.floodfill(img, corner, fill_color, thresh=30)
            
    img.save(output_logo, "PNG")
    print(f"Successfully processed {whatsapp_image} -> {output_logo}")
