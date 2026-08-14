import cv2
import numpy as np

# Load original image
img_path = r'C:\Users\maa\.gemini\antigravity-ide\brain\20b4e984-298a-4472-9ecb-67e8a9009b1a\media__1786002329434.jpg'
img = cv2.imread(img_path)

if img is None:
    print("Could not read image")
    exit(1)

# Create a mask
mask = np.zeros(img.shape[:2], np.uint8)

# Create background and foreground models for GrabCut
bgdModel = np.zeros((1, 65), np.float64)
fgdModel = np.zeros((1, 65), np.float64)

# Define a bounding box for the person. 
# The person is mostly in the center, so we leave a small margin around the image.
height, width = img.shape[:2]
# format: (x, y, width, height)
# the person is standing in the middle to the bottom
rect = (20, 20, width - 40, height - 20)

# Run grabcut
print("Running GrabCut...")
cv2.grabCut(img, mask, rect, bgdModel, fgdModel, 5, cv2.GC_INIT_WITH_RECT)

# Modify the mask: where it's sure background or probable background, set to 0. Otherwise 1.
mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')

# Multiply image with new mask
img_cut = img * mask2[:, :, np.newaxis]

# Convert to BGRA to add alpha channel
rgba = cv2.cvtColor(img_cut, cv2.COLOR_BGR2BGRA)

# Set alpha channel to 0 where mask is 0
rgba[:, :, 3] = mask2 * 255

# Optional: soften edges with a slight blur on the alpha channel
alpha = rgba[:, :, 3]
alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
rgba[:, :, 3] = alpha

# Save
output_path = r'src\assets\hero_cutout_real.png'
cv2.imwrite(output_path, rgba)
print(f"Saved cleanly cutout image to {output_path}")
