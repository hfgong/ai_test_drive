# Simple Virtual Machine and Assembler

This project implements a simple virtual machine (VM) and an assembler in Python. The VM supports a small set of instructions, and the assembler converts assembly code into machine code that the VM can execute. The code is generated using GPT-4o.

## Prompts

* Use Python to create a simple virtual machine and an assembler. Support ADD, SUB, MUL, MOV, JUMP, JUMPIF, LOAD, PRINT, HALT.  Make sure it can run a program print fibonacci at 10, Fib(10).  Use label based PC for operands of JUMP and JUMPIF.
* Where did you strip off the leading spaces?
* You need to make the instructions to support the second operands to be constant or register
* Add comments to code
* Does the Python code support stripping off of the ASM comments?

## Features

- **Instructions Supported**:
  - `ADD`: Add two registers.
  - `SUB`: Subtract one register from another.
  - `MUL`: Multiply two registers.
  - `MOV`: Move a value (register or immediate) into a register.
  - `JUMP`: Jump to a label.
  - `JUMPIF`: Conditional jump to a label.
  - `LOAD`: Load a value from memory into a register.
  - `PRINT`: Print the value of a register.
  - `HALT`: Halt the execution of the program.

- **Assembler**:
  - Converts assembly code with labels into machine code that the VM can execute.
  - Supports comments in the assembly code.

## Usage

1. **Define Your Program**:
   Write your program in assembly language. For example, the following program calculates and prints the 10th Fibonacci number:

   ```assembly
   START:  MOV R0 0       ; Initialize R0 to 0 (first Fibonacci number)
           MOV R1 1       ; Initialize R1 to 1 (second Fibonacci number)
           MOV R2 10      ; Initialize R2 to 10 (we want the 10th Fibonacci number)
           MOV R3 0       ; Initialize R3 to 0 (temporary register)
           JUMP CHECK     ; Jump to the CHECK label
   LOOP:   ADD R3 R0      ; R3 = R3 + R0 (next Fibonacci number)
           MOV R0 R1      ; Move R1 to R0 (shift R1 to R0)
           MOV R1 R3      ; Move R3 to R1 (shift the next Fibonacci number to R1)
           SUB R2 1       ; Decrement R2 by 1 (decrease the counter)
   CHECK:  JUMPIF R2 LOOP ; If R2 != 0, jump back to LOOP
           PRINT R0       ; Print the 10th Fibonacci number
           HALT           ; Halt the program
    ```