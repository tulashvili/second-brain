---
draft: false
modified: 2026-10-25 19:15:18+03:00
created: 2026-10-18 22:27:51+03:00
version: '0.05'
up:
- '[[control-flow|Control flow]]'
title: Linear Computations
translationKey: lineynye-vychisleniya
---
A linear algorithm is a type of [[algorithm|algorithm]] consisting entirely of the [[control-flow#Sequence|sequence]] construct, without [[control-flow#Branching|branches]] or [[control-flow#Loop|loops]]. Such a chain of actions is performed once and in a prescribed order; it has no path selection or return to an earlier step.

For example, suppose you want to find the sum of two numbers:
```
1. Obtain the numbers 3 and 4.
2. Add them: 3 + 4 = 7.
3. Display the answer 7.
```

This is what the chain looks like in [[pascal-programming-language|Pascal]]:
```pascal
program AddThreeNumbers;

var
    a, b, c, sum: Integer;

begin
    readln(a, b, c);
    sum:=a + b + c;
    writeln(sum);
end;
```

> [!seealso]
> This continues the earlier topics on [[pascal-variables-and-data-types]] and [[pascal-program-structure]]: before, we examined **where data is declared**; now, we examine **the order in which commands work with it**.

[[Нелинейные вычисления|Nonlinear Computations]]
