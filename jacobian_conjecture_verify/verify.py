"""
Verify the alleged Jacobian conjecture counterexample announced by
Levent Alpoge (@__alpoge__) on X/Twitter, 2026-07-20:
https://x.com/__alpoge__

Claim: the polynomial map F: C^3 -> C^3 given below has constant Jacobian
determinant -2 (a nonzero constant), yet is not injective — three distinct
points collapse to (-1/4, 0, 0).

If both properties hold, F refutes the Jacobian conjecture in dimension 3.
"""

from sympy import symbols, Matrix, Rational, simplify, expand

x, y, z = symbols('x y z')

# The three components of F(x, y, z)
f1 = (1 + x*y)**3 * z + y**2 * (1 + x*y) * (4 + 3*x*y)
f2 = y + 3*x*(1 + x*y)**2 * z + 3*x*y**2 * (4 + 3*x*y)
f3 = 2*x - 3*x**2*y - x**3*z

F = Matrix([f1, f2, f3])
V = Matrix([x, y, z])

# --- 1. Jacobian determinant ---
J = F.jacobian(V)
det = simplify(J.det())
print("Jacobian matrix:")
print(J)
print()
print("det(J) simplified :", det)
print("det(J) expanded   :", expand(det))
print()

# --- 2. Point-collapse check ---
points = [
    (0,   0,             Rational(-1, 4)),
    (1,  Rational(-3, 2), Rational(13, 2)),
    (-1, Rational( 3, 2), Rational(13, 2)),
]

print("Point mappings:")
for p in points:
    subs = {x: p[0], y: p[1], z: p[2]}
    img = tuple(simplify(fi.subs(subs)) for fi in (f1, f2, f3))
    print(f"  F{p} = {img}")
