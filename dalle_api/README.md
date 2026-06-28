# DALL-E Iterative Image Extension

This project uses OpenAI's DALL-E API to iteratively extend an image, creating a wide panoramic scene inspired by the famous Chinese painting "Along the River During the Qingming Festival" but set in a modern urban context.

## Description

This Python script takes an input image and uses it as the starting point for a series of image generations. Each generation extends the image to the right, creating a continuous, evolving urban scene. The final result is a wide panoramic image that blends modern urban elements with the spirit of the historical Chinese painting.

The code is generated using Claude Sonnet 3.5.

## Prompt

* Help me write OpenAI/DALLE API call and OpenCV in Python to do iterative masked image editing. I have an input image of portrait dimension, use it as the left part of a square image, to generate the right part. Then use the right half of the generated image as the left half, to do another masked image editing to generate a new image. Keep doing this for a couple of iterations to generate a lot of new half images, and stitch them together into a wide image. Store the generated image. Make sure to use the latest version of DALLE API.
* I think before we call the OpenAI API, we need to scale the input image (after padding) and masks to 1024x1024, since their API doesn't accept flexible image sizes.
* All generated area is black.  Probably we need to make the generated area bigger in the mask.
* But after the mask area change, it is still all black.  Could you add code to save the mask image and the API returned image for each iteration?
* The mask is not right, for DALLE API, it seems black means generation area, and white is the area to keep as it.

## Features

- Iterative image generation using DALL-E API
- Seamless stitching of generated images
- Creates a final wide panoramic image

## Requirements

- Python 3.7+
- OpenAI API key
- Required Python packages: 
  - openai
  - Pillow
  - numpy
  - opencv-python
  - requests

## Usage

1. Clone this repository.
2. Install the required packages:
```bash
pip install openai Pillow numpy opencv-python requests
```
3. Set up your OpenAI API key as an environment variable:
```bash
export OPENAI_API_KEY='your-api-key-here'
```
4. Run the script

## Acknowledgement

Both the input image and the prompt are generated in ChatGPT.  The prompt is tuned a couple of times for more reasonable generation.
