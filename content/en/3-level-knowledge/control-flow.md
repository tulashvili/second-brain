---
draft: false
modified: 2026-11-01 14:57:54+03:00
created: 2026-10-18 16:58:34+03:00
version: '0.1'
up:
- '[[programming-fundamentals|Programming fundamentals]]'
title: Control Flow
moc: true
tags:
- area
translationKey: upravlenie-posledovatelnostyu-deystviy
---
There are three ways to control the sequence of actions.

## Sequence

**Sequence** means commands execute one after another.

```pascal
sum := a + b;
writeln(sum);
```

> [!seealso]
> [[linear-computations|Linear Computations]]

## Branching

**Branching** means a program chooses what to do based on a condition:

```pascal
if age >= 18 then
    writeln('Adult')
else
    writeln('Minor');
```

> [!seealso]
> [[nonlinear-computations|Nonlinear Computations]]

## Loop

**A loop** repeats a command or block. A counted loop fits when the number of repetitions is known in advance:

```pascal
for i := 1 to 5 do
    writeln(i);
```

A `while` loop tests its condition before every iteration, so its body may not run at all. A `repeat ... until` loop executes the body first and then tests the condition, so it runs at least once. A loop inside another loop is **nested**; for example, it can iterate over table rows and columns.

> [!seealso]
> [[nonlinear-computations|Nonlinear Computations]]
