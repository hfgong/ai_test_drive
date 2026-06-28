import sympy as sp

# Define the variables and function
t = sp.symbols('t')
y = sp.Function('y')(t)

# Define the differential equation
diffeq = sp.Eq(y.diff(t, t) + y.diff(t) + y + t, 0)

# Solve the differential equation
solution = sp.dsolve(diffeq, y)

# Extract the right-hand side of the solution (y(t))
y_sol = solution.rhs

# Compute the first and second derivatives of the solution
y_prime = y_sol.diff(t)
y_double_prime = y_sol.diff(t, t)

# Substitute y, y', y'' into the original differential equation
lhs = y_double_prime + y_prime + y_sol + t
simplified_lhs = sp.simplify(lhs)

# Verify if the left-hand side is zero
verification = sp.Eq(simplified_lhs, 0)

# Display the results
solution, verification
