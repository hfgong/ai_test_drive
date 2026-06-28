import numpy as np
import matplotlib.pyplot as plt
from scipy.interpolate import interp1d

# Define constants
k_fuel = 50.0  # Proportional constant for fuel consumption rate (increased)
eta_max = 0.4  # Maximum fuel efficiency (adjusted)
alpha = 0.00001  # Constant for fuel efficiency function (adjusted)
omega_opt = 3000  # Optimal angular velocity for maximum efficiency (in RPM)
k_friction = 0.01  # Friction coefficient (adjusted)
c_f = 1.0  # Constant representing static friction (adjusted)
I = 10  # Moment of inertia

# Time parameters
dt = 0.01  # Time step
t_max = 10  # Maximum simulation time

# Time array
t = np.arange(0, t_max, dt)

# Input data for V (gas valve open level) and T_load (load torque)
V_data = [0.2, 0.5, 0.7, 0.6, 0.3]
T_load_data = [10, 15, 20, 15, 10]
time_points = [0, 2.5, 5, 7.5, 10]

# Interpolate V and T_load
V = interp1d(time_points, V_data, kind='linear', fill_value="extrapolate")
T_load = interp1d(time_points, T_load_data, kind='linear', fill_value="extrapolate")

# Initialize arrays for simulation results
omega = np.zeros_like(t)  # Angular velocity
P = np.zeros_like(t)  # Power output
T_total = np.zeros_like(t)  # Total torque
T_f = np.zeros_like(t)  # Internal friction torque
T_net = np.zeros_like(t)  # Net torque
alpha_array = np.zeros_like(t)  # Angular acceleration
eta_f = np.zeros_like(t)  # Fuel efficiency
m_dot = np.zeros_like(t)  # Fuel consumption rate

# Initial conditions
omega[0] = 1000  # Initial angular velocity in RPM

# Run the simulation
for i in range(1, len(t)):
    # Update fuel consumption rate
    m_dot[i] = k_fuel * V(t[i]) * omega[i-1]
    
    # Update fuel efficiency
    eta_f[i] = eta_max * (1 - np.exp(-alpha * (omega[i-1] - omega_opt)**2))
    
    # Update power output
    P[i] = m_dot[i] * eta_f[i]
    
    # Update total torque
    T_total[i] = P[i] / (2 * np.pi * omega[i-1] / 60) if omega[i-1] != 0 else 0  # Convert to torque in Nm
    
    # Update internal friction torque
    T_f[i] = k_friction * omega[i-1] + c_f
    
    # Update net torque
    T_net[i] = T_total[i] - T_f[i] - T_load(t[i])
    
    # Update angular acceleration
    alpha_array[i] = T_net[i] / I
    
    # Update angular velocity
    omega[i] = omega[i-1] + alpha_array[i] * dt
    
    # Debug print
    if i % int(1/dt) == 0:  # Print every 1 second
        print(f"Time: {t[i]:.2f}s, V: {V(t[i]):.2f}, T_load: {T_load(t[i]):.2f}, "
              f"omega: {omega[i]:.2f}, P: {P[i]:.2f}, T_total: {T_total[i]:.2f}, "
              f"T_f: {T_f[i]:.2f}, T_net: {T_net[i]:.2f}, alpha: {alpha_array[i]:.2f}")

# Plot the results
plt.figure(figsize=(14, 8))

plt.subplot(3, 1, 1)
plt.plot(t, omega, label='Angular Velocity (RPM)')
plt.xlabel('Time (s)')
plt.ylabel('Angular Velocity (RPM)')
plt.legend()
plt.grid()

plt.subplot(3, 1, 2)
plt.plot(t, P, label='Power Output (W)')
plt.xlabel('Time (s)')
plt.ylabel('Power Output (W)')
plt.legend()
plt.grid()

plt.subplot(3, 1, 3)
plt.plot(t, m_dot, label='Fuel Consumption Rate (kg/s)')
plt.xlabel('Time (s)')
plt.ylabel('Fuel Consumption Rate (kg/s)')
plt.legend()
plt.grid()

plt.tight_layout()
plt.show()
