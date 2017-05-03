# About Retro

Retro is a Microsoft MakeCode editor/simulator for a small subset of the 
ARM Thumb instruction set. You can code small assembly language programs
using the Blockly editor and run them in a simulator providing eight
32-bit registers (R0 through R7) and 64 32-bit words of memory. 

Retro supports word-level store and load instructions, so 
memory addresses must be multiples of 4, with minimal value 0 and maximal
value 252. Retro allows you to view values in decimal or hexadecimal
and to the change the state of registers and memory when the simulator
is not running. 

# on start block

The simulator only executes the instructions nestedd inside the "on start"
block, which can be found in the "Control" category.

# Arithmetic

Retro supports MOV, ADD and SUB instructions, as shown below:

```blocks
arithmetic.movsImm(Register.R0, 2)
arithmetic.addImm(Register.R1, 16)
arithmetic.subImm(Register.R1, 1)
arithmetic.add(Register.R2, Register.R0, Register.R1)
arithmetic.sub(Register.R3, Register.R2, Register.R0)
```

In the first three instructions above, the decimal value must be in the range
0-255.  The register (d) is the destination register, which is updated
by the instruction execution.  For the second
and third instructions, register (d) also is an input to the ADD/SUB operation.
So, the second instruction above increases the value in register R1 by decimal
value 16.
For the fourth and fifth instructions,  registers (s) and (n) are the inputs
to the ADD/SUB operation.  For example, the fourth instruction adds the values
in registers R0 and R1 and assigns the result to register R2. 


# Shift

Retro supports logical shift left (LSL) and logical shift right (LSR), as shown below:
```blocks
arithmetic.movsImm(Register.R0, 15)
shift.lsl(Register.R1, Register.R0, 8)
shift.lsr(Register.R2, Register.R1, 4)
```
In the shift instructions, the shift constant (V) must be in the range 0-31.  The value in
register (s) is shifted left/right by V bits. The
result of the shift operation is assigned to register (d), as usual.

Here's a short program for putting a 32-bit constant into register R0 using
a combination of MOV, ADD and LSL instructions:

```blocks
arithmetic.movsImm(Register.R0, 0xDE)
shift.lsl(Register.R0, Register.R0, 8)
arithmetic.addImm(Register.R0, 0xAD)
shift.lsl(Register.R0, Register.R0, 8)
arithmetic.addImm(Register.R0, 0xBE)
shift.lsl(Register.R0, Register.R0, 8)
arithmetic.addImm(Register.R0, 0xEF)
```

# Load and store

Retro supports word-level load and store instructions. 
Here's a simple program that increments value in the 
second word of memory (at address 4) by the quantity 3:

```blocks
arithmetic.movsImm(Register.R0, 4)
memory.ldr(Register.R1, Register.R0)
arithmetic.addImm(Register.R1, 3)
memory.str(Register.R1, Register.R0)
```

The address in the base register (b) of the LDR or STR
instruction must be a multiple of four and between the values 
of 0 and 252.

# Control flow

Retro supports CMP and conditional branch instructions
(BEQ, BNE, BLT, BGT, BLE, BGE), and ten predefined
labels.  Here's a program to increment all memory 
locations by 3:

```blocks
arithmetic.subImm(Register.R2, 4)
arithmetic.movsImm(Register.R0, 252)
control.label(Label.L1)
memory.ldr(Register.R1, Register.R0)
arithmetic.addImm(Register.R1, 3)
memory.str(Register.R1, Register.R0)
arithmetic.subImm(Register.R0, 4)
control.cmp(Register.R0, Register.R2)
control.beq(Condition.NE, Label.L1)

```

It is an error to use the same label twice
in a program or to branch to a label that is not in
the program.

See [GitHub repo](https://github.com/Microsoft/pxt-retro) for details.
