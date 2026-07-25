"""
A more human-friendly verification that det(J_F) = -2.

Instead of staring at the full symbolic determinant (which is a
horrific polynomial identity to check by hand), we split the claim
in two much smaller pieces:

  (A) det(J_F) evaluated at the ORIGIN (0,0,0) is trivially -2,
      because nearly every entry of J_F carries an x, y, or z factor,
      so the Jacobian collapses to a sparse permutation-like 3x3.

  (B) det(J_F) is a CONSTANT polynomial in Q[x, y, z]
      (has no non-constant terms).

Together, (A) + (B) imply det(J_F) = -2 identically.
"""

from sympy import symbols, Matrix, Rational, Poly, expand, diff, randprime
import random

x, y, z = symbols('x y z')

f1 = (1 + x*y)**3 * z + y**2 * (1 + x*y) * (4 + 3*x*y)
f2 = y + 3*x*(1 + x*y)**2 * z + 3*x*y**2 * (4 + 3*x*y)
f3 = 2*x - 3*x**2*y - x**3*z

F = Matrix([f1, f2, f3])
J = F.jacobian([x, y, z])

# ------------------------------------------------------------------
# (A) At the origin, most entries of J vanish.
# ------------------------------------------------------------------
J0 = J.subs({x: 0, y: 0, z: 0})
print("Step A -- Jacobian at the origin (should be very sparse):")
print(J0)
print(f"  det J(0,0,0) = {J0.det()}     <-- trivial by cofactor along row 1")
print()

# ------------------------------------------------------------------
# (B) The full symbolic determinant is a *constant* polynomial.
#     Two independent checks.
# ------------------------------------------------------------------
det_J = expand(J.det())

# (B1) sympy's Poly says the polynomial has degree 0 in every variable.
p = Poly(det_J, x, y, z)
print("Step B1 -- symbolic constancy check via sympy.Poly:")
print(f"  det J as a polynomial: {det_J}")
print(f"  Poly(det_J).is_ground = {p.is_ground}   (True <=> a constant)")
print(f"  total_degree          = {p.total_degree()}")
print()

# (B2) All three partial derivatives are the zero polynomial.
d_dx = expand(diff(det_J, x))
d_dy = expand(diff(det_J, y))
d_dz = expand(diff(det_J, z))
print("Step B2 -- constancy via vanishing gradient:")
print(f"  d(det J)/dx = {d_dx}")
print(f"  d(det J)/dy = {d_dy}")
print(f"  d(det J)/dz = {d_dz}")
print()

# ------------------------------------------------------------------
# (C) Monte Carlo evidence: evaluate det J at 20 random integer
#     points. Not a proof, but persuasive.
# ------------------------------------------------------------------
random.seed(0)
print("Step C -- Monte Carlo: det J at 20 random integer points:")
all_ok = True
for _ in range(20):
    pt = {x: random.randint(-9, 9),
          y: random.randint(-9, 9),
          z: random.randint(-9, 9)}
    val = J.subs(pt).det()
    ok = (val == -2)
    all_ok &= ok
    mark = "OK" if ok else "!!"
    print(f"  {mark}  point={ {str(k): v for k, v in pt.items()} }  det={val}")
print()
print(f"All 20 evaluations returned -2: {all_ok}")
