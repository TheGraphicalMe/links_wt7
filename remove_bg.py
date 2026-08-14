import cv2
import numpy as np

# Load the image
img = cv2.imread('src/assets/hero_cutout_real.png')

# Convert to RGBA
rgba = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)

# Convert to grayscale for thresholding
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# The background is very light (near white). We create a mask for it.
# Threshold value can be adjusted (e.g., > 240 is considered background)
_, mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY)

# Invert mask (so human is 255 and background is 0)
mask_inv = cv2.bitwise_not(mask)

# Clean up the mask using morphological operations (to remove noise/halos)
kernel = np.ones((3,3), np.uint8)
mask_inv = cv2.erode(mask_inv, kernel, iterations=1)
mask_inv = cv2.GaussianBlur(mask_inv, (5, 5), 0)

# Apply the mask to the alpha channel
rgba[:, :, 3] = mask_inv

# Save the result
cv2.imwrite('src/assets/hero_cutout_real.png', rgba)
print("Background removed successfully.")
