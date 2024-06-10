import io
import numpy as np
import matplotlib.pyplot as plt
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen


# Load the font file
font = TTFont("Roboto-Regular.ttf")

def smooth_contour(contour):
    # Convert contour to numpy array
    coordinates = np.array(contour)

    if coordinates.ndim == 1:
        # If the contour is 1-dimensional, reshape it to a 2-dimensional array
        coordinates = coordinates.reshape(-1, 2)

    # Reparameterize the path to arc length parameter
    distances = np.sqrt(np.sum(np.diff(coordinates, axis=0) ** 2, axis=1))
    arc_length = np.concatenate(([0], np.cumsum(distances)))
    total_length = arc_length[-1]
    num_points = 1000
    t = np.linspace(0, total_length, num_points)
    x = np.interp(t, arc_length, coordinates[:, 0])
    y = np.interp(t, arc_length, coordinates[:, 1])

    # Perform Fourier transform with respect to arc length
    fft_x = np.fft.rfft(x)
    fft_y = np.fft.rfft(y)

    # Drop the high-frequency components (e.g., keep 1% of the frequencies)
    keep_fraction = 0.01
    num_frequencies = len(fft_x)
    fft_x[int(num_frequencies * keep_fraction):] = 0
    fft_y[int(num_frequencies * keep_fraction):] = 0

    # Transform back into the curve domain
    smooth_x = np.fft.irfft(fft_x)
    smooth_y = np.fft.irfft(fft_y)

    return smooth_x, smooth_y


def smooth_glyph(glyph_name):
    # Extract the font path coordinates for the specified glyph
    glyph = font.getGlyphSet()[glyph_name]
    pen = RecordingPen()
    glyph.draw(pen)

    # Separate outline and holes
    outline = []
    holes = []
    current_contour = outline

    for operator, operands in pen.value:
        if operator == "moveTo":
            if len(current_contour) > 0:
                holes.append(current_contour)
            current_contour = []
            current_contour.append(operands[0])
        elif operator == "lineTo":
            current_contour.append(operands[0])
        elif operator == "curveTo":
            current_contour.extend(operands)
        elif operator == "qCurveTo":
            current_contour.extend(operands)
        elif operator == "closePath":
            current_contour.append(current_contour[0])

    if len(current_contour) > 0:
        holes.append(current_contour)

    # Smooth the outline and holes separately
    if len(outline) > 0:
        smooth_outline_x, smooth_outline_y = smooth_contour(outline)
    else:
        smooth_outline_x, smooth_outline_y = [], []

    smooth_holes = []
    for hole in holes:
        if len(hole) > 0:
            smooth_hole_x, smooth_hole_y = smooth_contour(hole)
            smooth_holes.append((smooth_hole_x, smooth_hole_y))

    return outline, holes, smooth_outline_x, smooth_outline_y, smooth_holes

# Specify the glyphs to smooth
glyphs = ['A', 'B', 'C']

# Create a figure and subplots for each glyph
fig, axes = plt.subplots(2, len(glyphs), figsize=(15, 10))

for i, glyph_name in enumerate(glyphs):
    # Smooth the glyph
    outline, holes, smooth_outline_x, smooth_outline_y, smooth_holes = smooth_glyph(glyph_name)

    # Plot the original outline and holes
    if len(outline) > 0:
        axes[0, i].plot([p[0] for p in outline], [p[1] for p in outline], 'b-', label='Original Outline')
    for hole in holes:
        if len(hole) > 0:
            axes[0, i].plot([p[0] for p in hole], [p[1] for p in hole], 'b--', label='Original Hole')

    axes[0, i].set_title(f"Original Glyph {glyph_name}")
    axes[0, i].axis('equal')

    # Plot the smoothened outline and holes
    if len(smooth_outline_x) > 0:
        axes[1, i].plot(smooth_outline_x, smooth_outline_y, 'r-', label='Smoothened Outline')
    for smooth_hole_x, smooth_hole_y in smooth_holes:
        if len(smooth_hole_x) > 0:
            axes[1, i].plot(smooth_hole_x, smooth_hole_y, 'r--', label='Smoothened Hole')

    axes[1, i].set_title(f"Smoothened Glyph {glyph_name}")
    axes[1, i].axis('equal')

plt.tight_layout()
plt.show()
