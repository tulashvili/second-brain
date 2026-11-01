---
draft: false
modified: 2026-11-01 14:31:02+03:00
created: 2026-10-18 16:53:47+03:00
version: '0.1'
up:
- '[[pascal-programming-language|Pascal programming language]]'
title: Pascal Program Structure
translationKey: obschiy-vid-programmy-v-pascal
---
## Pascal

A typical program consists of declarations and a command block:
```pascal
program Greeting;

var
  name: string;

begin
  readln(name);
  writeln('Hello, ', name);
end.
```

Suppose we need to find the sum of two numbers. First, define the algorithm: obtain two numbers, add them, and display the result:

```pascal
var
  a, b, sum: integer;

begin
  readln(a, b);
  sum := a + b;
  writeln(sum);
end.
```

In this example, input is `readln`, the calculation is `a + b`, assigning the result to a variable is `:=`, and output is `writeln`. This is how the course's core concepts connect: algorithms, variables, types, operators, and program structure.

## Program declaration section
In a Pascal program, the declaration section tells the compiler what data and additional facilities the program will use. It comes **before `begin`**, that is, before the main command block:
```pascal
programm Circle;

const
    Pi = 3.14159;

var
    radius, area: real;

begin
    area:= Pi * radius * radius;
    writeln(area);
end;
```
Here, the `Pi` constant and the `radius` and `area` variables are declared. The commands between `begin` and `end.` then perform the calculation and output.

### Order of subsections in classic Pascal
The order of subsections in classic Pascal is usually strictly defined; in some dialects they may be repeated or combined. Not every subsection is needed in every program. A simple task may need only `var`, or even none at all—for example, when a program works only with constants and commands.

| Section | Description | Purpose | Example |
| --- | --- | --- | --- |
| `label` — [[labels-and-jumps-in-pascal]] | Label declarations | Declares numeric or symbolic labels that can be jumped to with the `goto` operator. | `label 10, 20, start;` |
| `const` — [[pascal-variables-and-data-types]] | Constant declarations | Sets constant values that do not change while the program runs. | `const Pi = 3.1415; MaxSize = 100;` |
| `type` — Types, Procedures, and Functions in Pascal | User-defined type declarations | Makes it possible to create custom data types: enumerations, ranges, records, arrays, and classes. | `type Days = (Mon, Tue, Wed);` |
| `var` — [[pascal-variables-and-data-types]] | Variable declarations | Declares variables and their data types so that the compiler allocates memory for them. | `var x, y: integer; name: string;` |
| `procedure` and `function` — Types, Procedures, and Functions in Pascal | Subprogram declarations | Declares custom procedures and functions that can be called in the program body. | `procedure Hello; begin writeln('Hello'); end;` |

### Reading a program's declaration section
It is useful to view the declaration section as a list of resources declared in advance:

1. What is included through `uses`?
2. What values are defined as constants through `const`?
3. Which variables are listed after `var`, and what types do they have?
4. Are there custom types, procedures, or functions?
5. Where do declarations end and execution begin—at `begin`?

> [!important] Main rule
> Before using a variable or constant in commands, it usually has to be declared above, in the appropriate section.
