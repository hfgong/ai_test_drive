#include <iostream>
#include <vector>
#include <stdexcept>
#include <cmath>

// Function to transpose a matrix
std::vector<std::vector<double>> transpose(const std::vector<std::vector<double>>& matrix) {
    size_t rows = matrix.size();
    size_t cols = matrix[0].size();
    std::vector<std::vector<double>> result(cols, std::vector<double>(rows));
    for (size_t i = 0; i < rows; ++i)
        for (size_t j = 0; j < cols; ++j)
            result[j][i] = matrix[i][j];
    return result;
}

// Function to multiply two matrices
std::vector<std::vector<double>> multiply(const std::vector<std::vector<double>>& A, const std::vector<std::vector<double>>& B) {
    size_t rowsA = A.size();
    size_t colsA = A[0].size();
    size_t colsB = B[0].size();
    std::vector<std::vector<double>> result(rowsA, std::vector<double>(colsB, 0.0));
    for (size_t i = 0; i < rowsA; ++i)
        for (size_t j = 0; j < colsB; ++j)
            for (size_t k = 0; k < colsA; ++k)
                result[i][j] += A[i][k] * B[k][j];
    return result;
}

// Function to multiply a matrix and a vector
std::vector<double> multiply(const std::vector<std::vector<double>>& A, const std::vector<double>& b) {
    size_t rowsA = A.size();
    size_t colsA = A[0].size();
    std::vector<double> result(rowsA, 0.0);
    for (size_t i = 0; i < rowsA; ++i)
        for (size_t j = 0; j < colsA; ++j)
            result[i] += A[i][j] * b[j];
    return result;
}

// Function to compute the determinant of a 3x3 matrix
double determinant3x3(const std::vector<std::vector<double>>& matrix) {
    return matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
           matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
           matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
}

// Function to solve a 3x3 linear system using Cramer's Rule
std::vector<double> solve3x3(const std::vector<std::vector<double>>& A, const std::vector<double>& b) {
    double detA = determinant3x3(A);

    if (detA == 0) {
        throw std::runtime_error("The system has no unique solution.");
    }

    std::vector<std::vector<double>> A1 = A, A2 = A, A3 = A;
    for (int i = 0; i < 3; ++i) {
        A1[i][0] = b[i];
        A2[i][1] = b[i];
        A3[i][2] = b[i];
    }

    double detA1 = determinant3x3(A1);
    double detA2 = determinant3x3(A2);
    double detA3 = determinant3x3(A3);

    return {detA1 / detA, detA2 / detA, detA3 / detA};
}

// Function to add epsilon to the diagonal of a matrix
void addEpsilonToDiagonal(std::vector<std::vector<double>>& matrix, double epsilon) {
    for (size_t i = 0; i < matrix.size(); ++i) {
        matrix[i][i] += epsilon;
    }
}

// Function to solve an Nx3 linear system
std::vector<double> solveLinearSystem(const std::vector<std::vector<double>>& A, const std::vector<double>& b, double epsilon = 1e-10) {
    size_t rows = A.size();
    size_t cols = A[0].size();

    if (cols != 3 || b.size() != rows) {
        throw std::invalid_argument("Matrix A must be Nx3 and vector b must be of size N.");
    }

    std::vector<std::vector<double>> At = transpose(A);
    std::vector<std::vector<double>> AtA = multiply(At, A);
    std::vector<double> Atb = multiply(At, b);

    addEpsilonToDiagonal(AtA, epsilon);

    std::vector<std::vector<double>> AtA3x3 = {
        {AtA[0][0], AtA[0][1], AtA[0][2]},
        {AtA[1][0], AtA[1][1], AtA[1][2]},
        {AtA[2][0], AtA[2][1], AtA[2][2]}
    };

    std::vector<double> Atb3 = {Atb[0], Atb[1], Atb[2]};

    return solve3x3(AtA3x3, Atb3);
}

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
