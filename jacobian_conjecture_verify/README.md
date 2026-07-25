# Verifying a Claimed Counterexample to the Jacobian Conjecture

On **2026-07-20**, Levent Alpoge ([@__alpoge__](https://x.com/__alpoge__))
announced on X/Twitter that the **Jacobian conjecture is false**, exhibiting
the explicit polynomial map $F : \mathbb{C}^3 \to \mathbb{C}^3$

$$
F(x, y, z) = \Big(\,(1+xy)^3 z + y^2(1+xy)(4+3xy),\;\;
                  y + 3x(1+xy)^2 z + 3xy^2(4+3xy),\;\;
                  2x - 3x^2 y - x^3 z\,\Big)
$$

with two claimed properties:

1. The Jacobian determinant $\det(\partial F / \partial(x,y,z))$ is the
   constant $-2$.
2. $F$ is not injective: it collapses the three distinct points
   $(0,0,-\tfrac14)$, $(1,-\tfrac32,\tfrac{13}{2})$, and
   $(-1,\tfrac32,\tfrac{13}{2})$ all to the same image
   $(-\tfrac14,\,0,\,0)$.

Together, (1) + (2) would refute the **Jacobian conjecture** in dimension 3:
the conjecture claims that any polynomial map $\mathbb{C}^n \to \mathbb{C}^n$
with nonzero-constant Jacobian must be a bijection. It has been open since
Keller stated it in 1939.

This tiny project uses **SymPy** to check both claims symbolically (not
numerically), so we can be certain they hold as identities in
$\mathbb{Q}[x,y,z]$ rather than to some finite precision.

Original tweet author acknowledgement: **Levent Alpoge, @__alpoge__** — all
mathematical credit for the map and the collapsed points belongs to them.
This repo only performs the symbolic check.

## Files

- `verify.py` — SymPy script that prints the Jacobian matrix, its symbolic
  determinant, and $F$ evaluated at the three claimed collision points.
- `output.txt` — captured stdout from running `python3 verify.py`.
- `jacobian.tex` / `jacobian.pdf` / `jacobian.png` — typeset display of the
  full 3x3 Jacobian, its determinant, and the collision identity.
- `verify_easy.py` / `output_easy.txt` — a more human-friendly split of the
  determinant check (see below).

## Easier verification strategy

The full symbolic determinant is a 6-variable polynomial identity — awful
to check by hand. `verify_easy.py` splits the claim into three small,
individually cheap pieces:

**(A) Evaluate $J$ at the origin.** Almost every entry of $J$ carries an
$x$, $y$, or $z$ factor, so at $(0,0,0)$ the Jacobian collapses to a sparse
permutation-like matrix:

$$
J(0,0,0) \;=\; \begin{pmatrix} 0 & 0 & 1 \\ 0 & 1 & 0 \\ 2 & 0 & 0 \end{pmatrix},
\qquad \det = -2
$$

This is trivially verifiable by cofactor expansion along any row. So the
value $-2$ is fixed at at least one point.

**(B) Show $\det J$ is a *constant* polynomial.** Then by (A) that
constant must be $-2$ everywhere. Two independent checks:

- `Poly(det_J, x, y, z).is_ground` returns `True` (total degree 0).
- All three partial derivatives $\partial(\det J)/\partial x$,
  $\partial(\det J)/\partial y$, $\partial(\det J)/\partial z$ are the
  zero polynomial.

**(C) Sanity Monte Carlo.** Evaluating $\det J$ at 20 random integer
triples all return $-2$. Not a proof on its own, but combined with (B)
it's overwhelming evidence.

## Result

Both claims are confirmed symbolically:

```
det(J) simplified : -2
det(J) expanded   : -2

Point mappings:
  F(0, 0, -1/4)      = (-1/4, 0, 0)
  F(1, -3/2, 13/2)   = (-1/4, 0, 0)
  F(-1, 3/2, 13/2)   = (-1/4, 0, 0)
```

So — modulo any typo I might have introduced when transcribing the map from
the screenshot — the arithmetic in Alpoge's announcement is internally
consistent. Whether the announcement holds up to expert review is not
something this script can decide.

## Prompt list

- Read the attached screenshot; describe what is claimed.
- Verify the Jacobian and check the point mappings; use SymPy.
- Package the verification as a new sub-project under `ai_test_drive/` with
  the Python code, the run output, and an acknowledgement of the original
  author.
- Convert the Jacobian into display math in LaTeX and render to PDF/PNG.
- Offer an easier, more human-verifiable route than staring at the raw
  symbolic determinant.
