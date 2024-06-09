# Blender Coffee Mug Python IBPY) Script

This repository contains a Python script for creating a realistic coffee mug model in Blender. The script generates a mug with a hollow interior, a rim, and two handles attached to the mug body.

The script is created using Claude AI, with some manual modifications.

## Requirements

- Blender (version 2.8 or higher)

## Usage

1. Open Blender and create a new scene or open an existing one.

2. Switch to the Scripting workspace by clicking on the "Scripting" tab at the top of the Blender window.

3. In the Text Editor, click on the "New" button to create a new text file.

4. Copy and paste the provided Python script (`double_handle_mug.py`) into the text file.

5. Click on the "Run Script" button located at the bottom of the Text Editor or press "Alt + P" to execute the script.

6. Wait for the script to finish running. The coffee mug model will be created and centered in the 3D viewport.

7. You might need to start the Blender app from a terminal or command line for some versions.

## Prompts

* Help me write Blender Python code to create a coffee mug with two symmetric handles.
* It has only one handle, which is a cylinder, could you make it double handles (one left one right), in circular shapes?
* The handles are too high, move them down to the middle of the mug height, also I believe half toruses are enough.
* Do we need to subtract the inner part of the Mug body cylinder?

## Customization

You can customize the dimensions and properties of the coffee mug by modifying the relevant parameters in the script:

- `radius`: The radius of the mug body cylinder (default: 0.05)
- `depth`: The depth (height) of the mug body cylinder (default: 0.1)
- `inner_radius`: The radius of the inner part of the mug body cylinder (default: 0.045)
- `rim_major_radius`: The major radius of the mug rim torus (default: 0.05)
- `rim_minor_radius`: The minor radius of the mug rim torus (default: 0.01)
- `handle_major_radius`: The major radius of the handle torus (default: 0.03)
- `handle_minor_radius`: The minor radius of the handle torus (default: 0.005)
- `handle_location_x`: The X-coordinate of the handle location (default: 0.055 for right handle, -0.055 for left handle)
- `handle_location_z`: The Z-coordinate of the handle location (default: 0.025)

Feel free to experiment with these parameters to achieve different mug sizes and proportions.
