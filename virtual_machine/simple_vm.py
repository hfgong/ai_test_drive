class SimpleVM:
    def __init__(self, memory_size=256):
        # Initialize the virtual machine with a fixed-size memory and registers
        self.memory = [0] * memory_size
        self.registers = {'R0': 0, 'R1': 0, 'R2': 0, 'R3': 0}
        self.pc = 0
        self.running = True

    def load_program(self, program):
        # Load the program into the VM and extract labels for jump operations
        self.program = program
        self.labels = {label: i for i, (label, _) in enumerate(program) if label}

    def run(self):
        # Execute the program until a HALT instruction is encountered
        while self.running:
            label, instruction = self.program[self.pc]
            self.execute(instruction)
            self.pc += 1

    def get_value(self, operand):
        # Helper method to get the value of an operand, which can be a register or an immediate value
        if operand in self.registers:
            return self.registers[operand]
        else:
            return int(operand)

    def execute(self, instruction):
        # Execute a single instruction
        parts = instruction.split()
        op = parts[0]
        
        if op == 'ADD':
            # ADD <dest> <src>: dest = dest + src
            self.registers[parts[1]] += self.get_value(parts[2])
        elif op == 'SUB':
            # SUB <dest> <src>: dest = dest - src
            self.registers[parts[1]] -= self.get_value(parts[2])
        elif op == 'MUL':
            # MUL <dest> <src>: dest = dest * src
            self.registers[parts[1]] *= self.get_value(parts[2])
        elif op == 'MOV':
            # MOV <dest> <src>: dest = src
            self.registers[parts[1]] = self.get_value(parts[2])
        elif op == 'JUMP':
            # JUMP <label>: pc = label
            self.pc = self.labels[parts[1]] - 1
        elif op == 'JUMPIF':
            # JUMPIF <reg> <label>: if reg != 0, pc = label
            if self.registers[parts[1]] != 0:
                self.pc = self.labels[parts[2]] - 1
        elif op == 'LOAD':
            # LOAD <reg> <addr>: reg = memory[addr]
            self.registers[parts[1]] = self.memory[self.get_value(parts[2])]
        elif op == 'PRINT':
            # PRINT <reg>: print the value of reg
            print(self.registers[parts[1]])
        elif op == 'HALT':
            # HALT: stop execution
            self.running = False
        else:
            raise ValueError(f"Unknown instruction: {op}")

# Assembler function to convert assembly code into a list of instructions and labels
def assemble(asm_code):
    lines = asm_code.strip().split('\n')
    program = []
    for line in lines:
        line = line.split(';')[0].strip()  # Remove comments and strip spaces
        if line:  # Ignore empty lines
            if ':' in line:
                # Split label and instruction
                label, instruction = line.split(':', 1)
                program.append((label.strip(), instruction.strip()))
            else:
                program.append(('', line.strip()))
    return program

# Fibonacci example program
fib_program = """
START:  MOV R0 0       ; Initialize R0 to 0 (first Fibonacci number)
        MOV R1 1       ; Initialize R1 to 1 (second Fibonacci number)
        MOV R2 11      ; Initialize R2 to 10 (we want the 10th Fibonacci number)
        MOV R3 0       ; Initialize R3 to 0 (temporary register)
        JUMP CHECK     ; Jump to the CHECK label
LOOP:   ADD R3 R0      ; R3 = R3 + R0 (next Fibonacci number)
        MOV R0 R1      ; Move R1 to R0 (shift R1 to R0)
        MOV R1 R3      ; Move R3 to R1 (shift the next Fibonacci number to R1)
        SUB R2 1       ; Decrement R2 by 1 (decrease the counter)
CHECK:  JUMPIF R2 LOOP ; If R2 != 0, jump back to LOOP
        PRINT R0       ; Print the 10th Fibonacci number
        HALT           ; Halt the program
"""

# Assemble and run the program
program = assemble(fib_program)
vm = SimpleVM()
vm.load_program(program)
vm.run()
