# Seamless Mosaic Image Effect

This Python script creates a seamless mosaic effect on images using OpenCV. It divides the image into patches, replaces each patch with its average color, and adds slight distortions to create an artistic effect.

The code is generated using Claude 3.5 Sonnet.

## Features

- Splits the image into customizable sized patches
- Calculates the average color for each patch
- Creates distorted quadrilaterals for a more organic look
- Ensures seamless transitions between neighboring patches

## Prompt
* Use Python and OpenCV to create an image effect.  Split the image into 32x32 patches, replace each patch with a uniform color averaged over that patch.  To create some variation, add some random noise to the patch vertices to make them non-square quadrulateral.
* Could you make sure the shared vertices among neighborhood squares are perturbated consistently to create seamless mosaic?
