# Self-contained Robust Cramer Solver (C++ and Javascript)

This repository contains a self-contained implementation of a robust linear system solver using a variant of Cramer's rule. The solver is designed to handle overdetermined and underdetermined systems by employing the least squares method and minimal norm solution, respectively. It also includes a stabilization technique that adds a small multiple of the identity matrix (\(\epsilon I\)) to ensure numerical stability.

The code is generated using GPT-4o.

## Prompts
* Is there a simple formula to solve a 3x3 linear system?  I would like to implement a standalone solver, without introducing any expensive library. Please implement using only C++ standard libraries.
* Make it support Nx3 linear system.  When the system is overdetermined, use minimal square error, when the system is underdetermined, use minimal norm solution.
* Could you avoid inversion, just reuse the original 3x3 solution code?
* Cool, could you add \epsilon I to matrix A^TA when its det is zero, instead of just throwing?
* Help me convert the C++ code to javascript to run in Chrome browser


## Algorithm Description

The algorithm works as follows:
1. **Cramer's Rule**: Used for solving square systems (3x3).
2. **Least Squares Solution**: Applied to overdetermined systems (N > 3) to minimize the mean squared error.
3. **Minimal Norm Solution**: Applied to underdetermined systems (N < 3) by augmenting the matrix and vector to form a square system.
4. **Stabilization**: Adds \(\epsilon I\) to \(A^T A\) to ensure the matrix is invertible.

### Detailed Algorithm

1. **Transpose** the matrix \(A\).
2. **Multiply** \(A^T\) with \(A\) to form \(A^T A\).
3. **Add** \(\epsilon I\) to \(A^T A\) to ensure numerical stability.
4. **Multiply** \(A^T\) with \(b\) to form \(A^T b\).
5. **Solve** the 3x3 linear system \((A^T A + \epsilon I)x = A^T b\) using Cramer's rule.

## Example Usage

The following example demonstrates how to use the solver:

```cpp
// (Code implementation here)

int main() {
    // Example of an overdetermined system (4x3)
    std::vector<std::vector<double>> A_overdetermined = {
        {2, -1, 0},
        {1, 3, 4},
        {0, 2, 1},
        {3, 1, 2}
    };
    std::vector<double> b_overdetermined = {1, 12, 5, 7};

    // Example of an underdetermined system (2x3)
    std::vector<std::vector<double>> A_underdetermined = {
        {1, 2, 3},
        {4, 5, 6}
    };
    std::vector<double> b_underdetermined = {14, 32};

    try {
        std::vector<double> x_overdetermined = solveLinearSystem(A_overdetermined, b_overdetermined);
        std::cout << "Overdetermined solution: x1 = " << x_overdetermined[0] << ", x2 = " << x_overdetermined[1] << ", x3 = " << x_overdetermined[2] << std::endl;

        std::vector<double> x_underdetermined = solveLinearSystem(A_underdetermined, b_underdetermined);
        std::cout << "Underdetermined solution: x1 = " << x_underdetermined[0] << ", x2 = " << x_underdetermined[1] << ", x3 = " << x_underdetermined[2] << std::endl;
    } catch (const std::exception& e) {
        std::cerr << e.what() << std::endl;
    }

    return 0;
}
```
