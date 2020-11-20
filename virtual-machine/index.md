---
---

-   Computers don't execute JavaScript directly
    -   Each has its own <g key="instruction_set">instruction set</g>
    -   A <g key="compiler">compiler</g> translates high-level language into those instructions
-   Often use an intermediate representation called <g key="assembly_code">assembly code</g>
    -   Human-readable names instead of numbers
-   We will simulate a very (very) simple processor with a little bit of memory
    -   Also check out [Human Resource Machine][human-resource-machine]

## What is the architecture of our virtual machine?

-   An <g key="instruction_pointer">instruction pointer</g> that holds the memory address of the next instruction to execute
    -   Always starts at address 0
    -   Part of the <g key="abi">Application Binary Interface</g> (ABI) for our virtual machine
-   Four <g key="register">registers</g>
    -   No memory-to-memory operations
    -   Everything happens in or through registers
-   256 <g key="word_memory">words</g> of memory
    -   Stores both the program and the data
    -   Each address will fit in a single byte
-   Instructions are 3 bytes long
    -   <g key="op_code">Op code</g> fits into one byte
    -   Zero, one, or two operands, each a byte long
    -   Each operand is a register or a value (constant or address)
    -   So the largest constant we can represent directly is 256
    -   Use `r` and `v` to indicate format

::: fixme
Diagram of virtual machine architecture
:::

| Instruction | Code | Format | Action              | Example      | Equivalent                |
| ----------- | ---- | ------ | ------------------- | ------------ | ------------------------- |
|  `hlt`      |    1 | `--`   | Halt program        | `hlt`        | `process.exit(0)`         |
|  `ldc`      |    2 | `rv`   | Load immediate      | `ldc R0 123` | `R0 := 123`               |
|  `ldr`      |    3 | `rr`   | Load register       | `ldr R0 R1`  | `R0 := RAM[R1]`           |
|  `cpy`      |    4 | `rr`   | Copy register       | `cpy R0 R1`  | `R0 := R1`                |
|  `str`      |    5 | `rr`   | Store register      | `str R0 R1`  | `RAM[R1] := R0`           |
|  `add`      |    6 | `rr`   | Add                 | `add R0 R1`  | `R0 := R0 + R1`           |
|  `sub`      |    7 | `rr`   | Subtract            | `sub R0 R1`  | `R0 := R0 - R1`           |
|  `beq`      |    8 | `rv`   | Branch if equal     | `beq R0 123` | `if (R0 === 0) PC := 123` |
|  `bne`      |    9 | `rv`   | Branch if not equal | `bne R0 123` | `if (R0 !== 0) PC := 123` |
|  `prr`      |   10 | `r-`   | Print register      | `prr R0`     | `console.log(R0)`         |
|  `prm`      |   11 | `r-`   | Print memory        | `prm R0`     | `console.log(RAM[R0])`    |

-   Put architectural details into a file shared by other components

<%- include('/_inc/file.html', {file: 'architecture.js'}) %>

## How can we execute these instructions?

-   As before, split a class that would normally be written in one piece into several pieces for exposition
-   Start by defining a class with an instruction pointer, some registers, and some memory
    -   Also have a prompt for output

<%- include('/_inc/erase.html', {file: 'vm-base.js', tag: 'skip'}) %>

-   A program is an array of numbers
    -   Copy into RAM and reset the instruction pointer and registers

<%- include('/_inc/slice.html', {file: 'vm-base.js', tag: 'initialize'}) %>

-   To get the next instruction:
    -   Get the value in memory that the instruction pointer currently refers to
    -   Move the instruction pointer on by one address
    -   Use bitwise operations to extract op code and operands from the instruction
    -   Some instructions don't have two operands, but a hardware implementation would unpack the same number every time

<%- include('/_inc/slice.html', {file: 'vm-base.js', tag: 'fetch'}) %>

-   We have included assertions
    -   Hardware detects illegal instructions and out-of-bounds memory addresses
-   Now we implement the run cycle
    -   Fetch instruction and take action until told to stop

<%- include('/_inc/erase.html', {file: 'vm.js', tag: 'skip'}) %>

-   Some typical instructions
-   Store the value of one register in the address held by another register

<%- include('/_inc/slice.html', {file: 'vm.js', tag: 'op_str'}) %>

-   Add the value in one register to the value in another register

<%- include('/_inc/slice.html', {file: 'vm.js', tag: 'op_add'}) %>

-   Jump to a fixed address if the value in a register is zero

<%- include('/_inc/slice.html', {file: 'vm.js', tag: 'op_beq'}) %>

## What do assembly programs look like?

-   We could create numbers ourselves
-   Much easier to use an <g key="assembler">assembler</g> to turn a very simple language into those numbers
    -   A compiler for a particular kind of machine-oriented language
-   Here's a program to print the value stored in R1 and then halt

<%- include('/_inc/file.html', {file: 'print-r1.as'}) %>

-   This is its numeric representation

<%- include('/_inc/file.html', {file: 'print-r1.mx'}) %>

-   This program prints the numbers from 0 to 2

<%- include('/_inc/multi.html', {pat: 'count-up.*', fill: 'as mx'}) %>

-   The <g key="label_address">label</g> `loop` doesn't take up any space
    -   Tells the assembler to give the address of the next instruction a name
    -   We can then refer to that address as `@loop`
-   Trace its execution
    -   R0 holds the current loop index
    -   R1 holds the loop's upper bound (in this case 3)
    -   Loop prints the value of R0 (one instruction)
    -   Adds 1 to R0 (two instructions because we can only add register-to-register)
    -   Checks to see if we should loop again (three instructions)
    -   If we *don't* jump back, halt
-   Steps in assembly are pretty simple
    -   Get interesting lines
    -   Find the addresses of labels
    -   Turn each remaining line into an instruction

<%- include('/_inc/slice.html', {file: 'assembler.js', tag: 'assemble'}) %>

-   To find labels, go through lines one by one
    -   Either save the label *or* increment the current address, because labels don't take up space

<%- include('/_inc/slice.html', {file: 'assembler.js', tag: 'find-labels'}) %>

-   To compile a single instruction
    -   Break the line into <g key="token">tokens</g>
    -   Look up the format for the operands
    -   Pack them into a single value

<%- include('/_inc/slice.html', {file: 'assembler.js', tag: 'compile'}) %>

-   Combining op codes and operands into a single value is the reverse of the unpacking done by the virtual machine

<%- include('/_inc/slice.html', {file: 'assembler.js', tag: 'combine'}) %>

-   A few utility functions

<%- include('/_inc/slice.html', {file: 'assembler.js', tag: 'utilities'}) %>

-   Let's try running a few programs and display:
    -   Their output
    -   The registers
    -   The interesting contents of memory
-   Counting up to three

<%- include('/_inc/file.html', {file: 'count-up.as'}) %>
<%- include('/_inc/file.html', {file: 'count-up-out.txt'}) %>

## How can we store data?

-   Allocate storage after the program for arrays
-   Use `.data` on a line of its own to mark the start of the data section
-   Then `label: number` to give a region a name and allocate some storage space
-   A few changes to the assembler
-   Split the lines into instructions and data allocations

<%- include('/_inc/slice.html', {file: 'allocate-data.js', tag: 'assemble'}) %>

<%- include('/_inc/slice.html', {file: 'allocate-data.js', tag: 'split-allocations'}) %>

-   Figure out where each allocation will lie and create a label accordingly

<%- include('/_inc/slice.html', {file: 'allocate-data.js', tag: 'add-allocations'}) %>

-   And that's it: no changes needed to compilation or execution
-   Fill an array with the numbers from 0 to 3

<%- include('/_inc/file.html', {file: 'fill-array.as'}) %>
<%- include('/_inc/file.html', {file: 'fill-array-out.txt'}) %>