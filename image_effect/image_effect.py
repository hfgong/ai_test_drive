import cv2
import numpy as np

def create_seamless_mosaic_effect(image_path, patch_size=32, noise_range=8):
    # Read the image
    img = cv2.imread(image_path)
    height, width = img.shape[:2]

    # Calculate the number of patches in each dimension
    patches_y = height // patch_size + 1
    patches_x = width // patch_size + 1

    # Create a grid of vertices
    vertices = np.zeros((patches_y + 1, patches_x + 1, 2), dtype=np.float32)
    for i in range(patches_y + 1):
        for j in range(patches_x + 1):
            vertices[i, j] = [j * patch_size, i * patch_size]

    # Add random noise to all vertices
    noise = np.random.uniform(-noise_range, noise_range, vertices.shape)
    vertices += noise

    # Create a blank canvas for the output
    result = np.zeros_like(img)

    # Iterate over the image in patches
    for y in range(patches_y):
        for x in range(patches_x):
            # Define the patch
            patch_y = y * patch_size
            patch_x = x * patch_size
            patch = img[patch_y:patch_y+patch_size, patch_x:patch_x+patch_size]
            
            # Calculate the average color of the patch
            avg_color = np.mean(patch, axis=(0, 1)).astype(int)

            # Get the four vertices for this patch
            quad_vertices = np.array([
                vertices[y, x],
                vertices[y, x+1],
                vertices[y+1, x+1],
                vertices[y+1, x]
            ])

            # Draw the quadrilateral on the result image
            cv2.fillPoly(result, [quad_vertices.astype(int)], avg_color.tolist())

    return result

# Usage
input_image = "image.jpg"
output_image = create_seamless_mosaic_effect(input_image)

# Save the result
cv2.imwrite("seamless_mosaic_effect.jpg", output_image)
