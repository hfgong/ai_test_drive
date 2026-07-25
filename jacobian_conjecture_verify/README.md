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
