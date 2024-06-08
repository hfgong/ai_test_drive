import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import curve_fit

def bezier_curve(t, *p):
    """
    Bezier curve function.

    Parameters:
    - t: Array of parameter values (0 <= t <= 1) at which to evaluate the Bezier curve.
    - *p: Variable-length argument list representing the vertices of the Bezier curve.
          The vertices are passed as separate arguments, and the number of vertices
          determines the degree of the Bezier curve.

    Returns:
    - Array of values representing the points on the Bezier curve at the given parameter values.

    Convention:
    - The Bezier curve is defined by a set of vertices (control points) p0, p1, ..., pn.
    - The vertices are passed as separate arguments to the function using the *p syntax.
    - The order of the vertices is as follows:
      - p0: The first vertex (starting point) of the Bezier curve.
      - p1, p2, ..., pn-1: The intermediate vertices that control the shape of the curve.
      - pn: The last vertex (ending point) of the Bezier curve.
    - The degree of the Bezier curve is determined by the number of vertices (n+1).
    - The parameter t varies from 0 to 1, where t=0 corresponds to the starting point (p0)
      and t=1 corresponds to the ending point (pn).

    Formula:
    - The Bezier curve is calculated using the following formula:
      B(t) = sum(i=0 to n) { C(n,i) * (1-t)^(n-i) * t^i * p[i] }
      where C(n,i) is the binomial coefficient (n choose i),
      and p[i] represents the i-th vertex of the Bezier curve.
    """
    n = len(p) - 1
    return sum([p[i] * np.math.comb(n, i) * (1-t)**(n-i) * t**i for i in range(n+1)])

def sine_func(x, a, b, c, d):
    return a * np.sin(b * x + c) + d

def exp_func(x, a, b, c):
    return a * np.exp(b * x) + c

# Generate data points
sine_x = np.linspace(-2*np.pi, 2*np.pi, 200)
sine_y = sine_func(sine_x, 1, 1, 0, 0) + np.random.normal(0, 0.1, sine_x.shape)

exp_x = np.linspace(-2, 2, 200)
exp_y = exp_func(exp_x, 1, 0.5, 0) + np.random.normal(0, 0.1, exp_x.shape)

# Fit sine wave with Bezier curve
num_vertices_sine = 10
sine_popt, _ = curve_fit(bezier_curve, sine_x, sine_y, p0=[0]*(num_vertices_sine+1))
sine_fit = bezier_curve(sine_x, *sine_popt)

# Fit exponential function with Bezier curve
num_vertices_exp = 8
exp_popt, _ = curve_fit(bezier_curve, exp_x, exp_y, p0=[0]*(num_vertices_exp+1))
exp_fit = bezier_curve(exp_x, *exp_popt)

# Print Bezier parameters
print("Sine Wave Bezier Parameters:")
for i, param in enumerate(sine_popt):
    print(f"p{i}: {param:.3f}")

print("\nExponential Function Bezier Parameters:")
for i, param in enumerate(exp_popt):
    print(f"p{i}: {param:.3f}")

# Plot the results
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 8))

ax1.plot(sine_x, sine_y, 'b.', label='Original Sine')
ax1.plot(sine_x, sine_fit, 'r-', label='Bezier Fit')
ax1.set_title('Sine Wave Fit with Bezier Curve')
ax1.set_xlabel('x')
ax1.set_ylabel('y')
ax1.legend()

ax2.plot(exp_x, exp_y, 'b.', label='Original Exponential')
ax2.plot(exp_x, exp_fit, 'r-', label='Bezier Fit')
ax2.set_title('Exponential Function Fit with Bezier Curve')
ax2.set_xlabel('x')
ax2.set_ylabel('y')
ax2.legend()

plt.tight_layout()
plt.show()
