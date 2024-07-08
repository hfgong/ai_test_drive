import os
import requests
import numpy as np
import cv2
from PIL import Image, ImageDraw
from io import BytesIO
import openai

# Set up OpenAI API key
openai.api_key = os.environ["OPENAI_API_KEY"]

def load_and_prepare_image(image_path):
    # Load the image
    img = cv2.imread(image_path)
    
    # Convert BGR to RGB
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Get the dimensions
    height, width = img_rgb.shape[:2]
    
    # Create a square canvas
    square_size = max(height, width)
    square_img = np.zeros((square_size, square_size, 3), dtype=np.uint8)
    
    # Paste the original image on the left side
    square_img[:height, :width] = img_rgb
    
    # Resize to 1024x1024
    square_img_resized = cv2.resize(square_img, (1024, 1024))
    
    return square_img_resized

def generate_right_half(left_half, iteration):
    # Convert numpy array to PIL Image
    left_half_pil = Image.fromarray(left_half)
    
    # Create a mask for the right half plus a bit more
    mask = Image.new('RGBA', (1024, 1024), (255, 255, 255, 255))
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rectangle([480, 0, 1024, 1024], fill=(0, 0, 0, 0))
    
    # Save the mask image
    mask.save(f'mask_iteration_{iteration}.png')
    
    # Save the image and mask to BytesIO objects
    img_byte_stream = BytesIO()
    mask_byte_stream = BytesIO()
    left_half_pil.save(img_byte_stream, format='PNG')
    mask.save(mask_byte_stream, format='PNG')
    img_byte_stream.seek(0)
    mask_byte_stream.seek(0)
    
    # The detailed prompt
    prompt = """Photorealistic and modern interpretation of the famous Chinese painting 'Along the River During the Qingming Festival,' 
    depicting a bustling contemporary urban street scene. The scene features a busy city street with modern shops, and 
    people in fashionable attire. There are street vendors selling food, people riding bicycles and scooters, and some cars. 
    Ensure to use scattered perspective or multiple-point perspective to keep near object similar sizes."""

    try:
        # Call OpenAI API
        response = openai.Image.create_edit(
            image=img_byte_stream,
            mask=mask_byte_stream,
            prompt=prompt,
            n=1,
            size="1024x1024"
        )
        
        # Get the generated image URL
        image_url = response['data'][0]['url']
        
        # Download the image
        response = requests.get(image_url)
        img = Image.open(BytesIO(response.content))
        
        # Save the API-returned image
        img.save(f'api_returned_image_iteration_{iteration}.png')
        
        # Convert PIL Image to numpy array
        img_array = np.array(img)
        
        # Extract the right half
        right_half = img_array[:, 512:]
        
        return right_half

    except Exception as e:
        print(f"Error in generate_right_half: {str(e)}")
        raise

def stitch_images(image_parts):
    return np.hstack(image_parts)


def main(input_image_path, num_iterations):
    # Load and prepare the initial image
    current_image = load_and_prepare_image(input_image_path)
    
    # List to store all generated halves
    all_halves = [current_image[:, :512]]
    
    for i in range(num_iterations):
        print(f"Generating iteration {i+1}...")
        # Generate the right half
        right_half = generate_right_half(current_image, i+1)
        
        # Add the generated right half to the list
        all_halves.append(right_half)
        
        # Prepare for the next iteration
        current_image = np.hstack([right_half, np.zeros_like(right_half)])
    
    # Stitch all halves together
    final_image = stitch_images(all_halves)
    
    # Save the final image
    cv2.imwrite('final_wide_image.png', cv2.cvtColor(final_image, cv2.COLOR_RGB2BGR))
    
    print("Final wide image saved as 'final_wide_image.png'")
    print("Mask images and API-returned images for each iteration have been saved.")

# Run the main function
if __name__ == "__main__":
    input_image_path = "street.jpg"
    num_iterations = 5  # Adjust this number as needed
    main(input_image_path, num_iterations)
