# Car Engine Dynamics and Fuel Consumption Simulation

This repository contains a simulation model for car engine dynamics and fuel consumption. The model considers engine angular velocity, fuel consumption rate, fuel efficiency, power output, torque, and time-varying factors such as gas valve open level and load torque.

The code and Latex document are generate using GPT-4o.

## Contents

- `engine_simulation.py`: Python script to run the engine simulation.
- `engine_simulation.tex`: LaTeX document explaining the formulas used in the simulation.

## Requirements

- NumPy
- Matplotlib
- SciPy

## Prompts

* Help me write formulas to simulate car engine dynamics and fuel consumption.  Note that the power of the engine is determined by the fuel consumption rate and fuel efficiency.  The fuel efficiency can be assumed to be a function of engine angular velocity because it determines the piston movements.  The fuel consumption rate is proportional to gas valve open level and angular velocity, because both two factors determine the fuel injection volume.  The power of course is closely related to the total torque and angular velocity, but it has to balance some internal friction torque, then the rest is net torque that can accelerate the angular velocity dominated by a fix rotation momentum.

* Let V be time varying too, because it is an external factor determined by the driver.  Also add a load torque to tract the car, which is also time varying, determined by factors like clutch attaching/detaching and gearshift.

* Put the formulas into a latex document

* Based on the formulas, write Python code to run a simulation of an engine.  The input $V$ and $T_{load}$ can be interpolated based on lists.

* Both internal friction rate and fuel consumption coefficient are k_f?
