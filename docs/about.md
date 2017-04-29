# About Retro

Retro is a Microsoft MakeCode editor/simulator for a small subset of the 
ARM Thumb instruction set. You can code small assembly language programs
using the Blockly editor and run them in a simulator providing eight
32-bit registers (R0 through R7) and 64 32-bit words of memory. 

Legal memory addresses are multiples of 4, with minimal value 0 and maximal
value 252. Retro allows you to view values in decimal or hexadecimal
and to the change the state of registers and memory when the simulator
is not running. 

# on start block

The simulator only executes the instructions nestedd inside the "on start"
block, which can be found in the "Control" category.

# Arithemetic

Retro supports MOV, ADD and SUB instructions, as shown below:
```blocks
arithmetic.movsImm(Register.R0, 2)
arithmetic.addImm(Register.R1, 16)
arithmetic.subImm(Register.R1, 1)
arithmetic.add(Register.R2, Register.R0, Register.R1)
arithmetic.sub(Register.R3, Register.R2, Register.R0)
```
In the first three instructions above, the decimal value must be in the range
0-255.

# Shift

Retro supports logical shift left (LSL) and logical shift right (LSR), as shown below:
```blocks
arithmetic.movsImm(Register.R0, 15)
shift.lsl(Register.R1, Register.R0, 8)
shift.lsr(Register.R2, Register.R1, 4)
```
In the shift instructions, the shift constant must be in the range 0-31.

# Load and store
Retro supports load and store at the word-level. Here's a simple program
that increments value in the top word in memory by three:
```
arithmetic.movsImm(Register.R0, 252)
memory.ldr(Register.R1, Register.R0)
arithmetic.addImm(Register.R1, 3)
memory.str(Register.R1, Register.R0)
```

# Control flow



See [GitHub repo](https://github.com/Microsoft/pxt-retro) for details.
