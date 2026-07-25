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

from sympy import symbols, Matrix, Rational, Poly, expand, diff
import random, math

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
# (C) Monte Carlo evidence, with Schwartz-Zippel bookkeeping.
#
# A-priori bound on deg(det J) (using row-max entry degrees, this is
# a valid upper bound whether or not the determinant cancels):
#   row 0 max entry deg = 6
#   row 1 max entry deg = 5
#   row 2 max entry deg = 3
#   =>  deg(det J) <= 14
#
# Schwartz-Zippel: if P is a nonzero polynomial of total degree <= d
# over Q, and we sample each variable uniformly from S subset Z with
# |S| values, then Pr[P(vec) = 0] <= d / |S| per sample, and the
# probability of a false-positive over k independent samples is
# <= (d/|S|)^k.
#
# To make MC evidence strong ON ITS OWN, pick |S| >> d and k large
# enough that (d/|S|)^k is negligible.
# ------------------------------------------------------------------
D_BOUND = 14        # a-priori upper bound on total degree of det J
N       = 1000      # sample from {-N, ..., N}, so |S| = 2N+1
K       = 30        # number of independent samples

S = 2*N + 1
per_sample = D_BOUND / S
overall    = per_sample ** K
print("Step C -- Monte Carlo with Schwartz-Zippel bound:")
print(f"  a-priori deg(det J) <= d = {D_BOUND}")
print(f"  sample range |S| = 2*{N}+1 = {S}")
print(f"  independent samples k = {K}")
print(f"  per-sample false-positive bound d/|S|      = {per_sample:.3e}")
print(f"  overall bound (d/|S|)^k                    = {overall:.3e}")
print(f"  ~ approx. equivalent to {-math.log10(overall):.1f} decimal 9s of confidence")
print()

random.seed(0)
all_ok = True
for i in range(K):
    pt = {x: random.randint(-N, N),
          y: random.randint(-N, N),
          z: random.randint(-N, N)}
    val = J.subs(pt).det()
    ok = (val == -2)
    all_ok &= ok
    mark = "OK" if ok else "!!"
    xv, yv, zv = pt[x], pt[y], pt[z]
    print(f"  {mark}  ({xv:>5},{yv:>5},{zv:>5})  det={val}")
print()
print(f"All {K} evaluations returned -2: {all_ok}")

# ------------------------------------------------------------------
# (D) Human-readable demo: the exact 9 small-integer points shown in
#     jacobian.tex / jacobian.pdf, with the full 3x3 Jacobian matrix
#     printed at each so a reader can Sarrus-expand by hand.
# ------------------------------------------------------------------
demo_pts = [
    (0, 0, 0), (1, 0, 0), (0, 1, 0),
    (0, 0, 1), (1, 1, 0), (-1, 1, 0),
    (1, -1, 1), (2, 1, -1), (-1, 2, 1),
]
print()
print("Step D -- demo of 9 human-readable points (with full J matrix at each).")
demo_ok = True
for (xv, yv, zv) in demo_pts:
    Jp = J.subs({x: xv, y: yv, z: zv})
    val = Jp.det()
    ok = (val == -2)
    demo_ok &= ok
    rows = [[int(Jp[i, j]) for j in range(3)] for i in range(3)]
    print(f"  point ({xv:>2},{yv:>2},{zv:>2}):  J = "
          f"[{rows[0]}, {rows[1]}, {rows[2]}]  det = {val}   {'ok' if ok else '!!'}")
print()
print(f"All {len(demo_pts)} demo points returned -2: {demo_ok}")
