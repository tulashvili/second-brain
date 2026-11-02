---
modified: 2026-11-02 15:27:27+03:00
created: 2026-10-25 19:15:08+03:00
draft: false
version: '0.1'
up:
- '[[control-flow]]'
translationKey: nelineynye-vychisleniya
title: Nonlinear Computations
---
> [!tldr]
> **Main idea:** a program does not have to execute every statement exactly once in sequence. It can **choose an action** based on a condition or **repeat an action** several times. Here, “nonlinear” describes the program's flow of execution, not the shape of a mathematical function.
## 1. The `if` statement

First, the program evaluates a condition. For example, when `age = 20`, the expression `age >= 18` evaluates to `True`. Then `if` directs execution to the appropriate branch:

```pascal
  if age >= 18 then
    WriteLn('Access granted') // A semicolon is NOT ALLOWED here because else follows
  else
    WriteLn('Access denied');
```

`then` means “in that case,” and `else` means “otherwise.” When `age = 20`, the first line is printed; when `age = 16`, the second. This is **two-way branching**: an action is provided for both outcomes of the test.

If nothing needs to happen when the condition is false, use **one-way branching**:

```pascal
if score >= 80 then
  WriteLn('Check the event');
```

When `score = 85`, the message appears. When `score = 50`, the program simply moves on to the next statement.
### Several actions in one branch

Without additional constructs, `then` or `else` is followed by **one statement**. To execute several commands as a single action, combine them into a **compound statement**, or block, between `begin` and `end`:

```pascal
if score >= 80 then
begin
  WriteLn('Check the event');
  WriteLn('Save the check result');
end
else
  WriteLn('Normal processing');
```

Do **not** put a semicolon after `end` before `else`: otherwise, the conditional statement ends before the `else` branch.
### Nested conditions and `else if`
Conditions can be checked in sequence:

```pascal
if score >= 80 then
  WriteLn('High')
else if score >= 40 then
  WriteLn('Medium')
else
  WriteLn('Low');
```

For `score = 55`, the first test is false and the second is true, so the result is `Medium`. The third branch is not executed. If an `if` is nested inside another `if`, an `else` belongs to the nearest applicable `if`; `begin ... end` blocks help make the intended relationship explicit.
## 2. A conditional expression: choosing a value

Sometimes you need to choose **one value**, rather than an entire block of actions. The course notes show this syntax for PascalABC.NET:

```PascalABC.NET
var smaller := if a < b then a else b;
```

When `a = 7` and `b = 11`, the condition is true, so `smaller = 7`. The notes also give the form `condition ? value1 : value2`, familiar from C-family languages. This is an **expression that returns a value**; the `if` in the previous section controlled the execution of statements. The values in the two branches must have compatible types.
## 3. Choosing among several alternatives: `case`
When one value must be matched against several alternatives, `case` is convenient:

```
case month of
  3..5: Print('Spring');
  6..8: Print('Summer');
  9..11: Print('Autumn');
  12, 1, 2: Print('Winter');
else
  Print('Invalid month number')
end;
```

Here, `month` is the **selector**: the value used to choose a branch. `3..5` means the inclusive range from 3 to 5; commas list individual values. If `month = 4`, the first branch matches and prints `Spring`. If `month = 13`, none of the lists matches, so `else` executes.

The same choice could be expressed as an `if ... else if` chain, but `case` is clearer when **one value** is checked against lists or ranges.
## 4. Loops: repeating actions

A **loop** consists of a condition or counter in its header and a **body**: the statements that repeat. One pass through the body is called an **iteration**. This idea has already been covered here — [[control-flow|Control Flow]]; now we will examine *exactly when* repetition ends.

### `loop`: the repetition count is known, but the iteration number is not needed

`loop` is a PascalABC.NET construct for a specified number of passes:

```
var sum := 0;
loop 6 do
  sum += ReadInteger;
Print(sum);
```

If the input is `2, 4, -1, 3, 0, 5`, the value of `sum` after each input is `2 → 6 → 5 → 8 → 8 → 13`. The result is `13`. The program did not need the iteration number.

### `for`: the counter range is known

```
for var i := 2 to 4 do
  Print(i);
```

Here, `i` is the **loop variable**, or counter. It takes the values `2`, `3`, and `4` in sequence; the body runs three times. For integer bounds with a step of 1, the number of passes is `end − start + 1`, provided the start is no greater than the end. In this example: `4 − 2 + 1 = 3`.

Use `downto` for descending iteration:

```
for var i := 5 downto 3 do
  Print(i);  // 5 4 3
```

The course notes also include a form with an explicit step:

```
for var i := 5 to 13 step 3 do
  Print(i);  // 5 8 11
```

After `11`, the next value would be `14`, which exceeds the upper bound of `13`. If the bounds do not match the direction of iteration, the body may never execute. A counter declared directly in the header with `var` is unavailable outside its scope.

### `while`: test **before** acting

```
var n := ReadInteger;
var sum := 0;

while n <> 0 do
begin
  sum += n;
  n := ReadInteger;
end;

Print(sum);
```

`<>` means “not equal.” For the input `3, 5, 0`, the following happens:

1. `3 <> 0` is true → add 3 and read 5.
2. `5 <> 0` is true → the sum becomes 8 and 0 is read.
3. `0 <> 0` is false → the body is skipped and 8 is printed.

If the first input is `0`, the body never executes. The number of passes is not known in advance. It is important to change the data that affects the condition: if it remains true forever, the loop will not end.

### `repeat ... until`: test **after** acting

```
var sum := 0;
var n: integer;

repeat
  n := ReadInteger;
  if n <> 0 then
    sum += n;
until n = 0;

Print(sum);
```

Here, the program reads a number first and only then tests `n = 0`. The body therefore executes **at least once**. For `3, 5, 0`, the sum is also 8. In the example in the course notes' table, both loop forms sum the input until zero, but arrange the first read differently. `repeat ... until` is useful when the condition cannot be tested before the first action, such as before the first input.

The distinction is easy to remember:

- `while condition do` — **continue while the condition is true**;
- `repeat ... until condition` — **stop when the condition is true**.

### Early exit and skipping part of the body

`break` immediately terminates the current loop. `continue` skips the remainder of the current iteration: in `for`, control moves to the next counter value; in `while`, to a new condition test; in `repeat`, to the test after `until`.

A **nested loop** is a loop inside another loop. For example, the outer loop goes through two rows and the inner loop through three columns. The action in the inner body runs `2 × 3 = 6` times. The term appears in the glossary and your topic 1 map, although these course notes do not contain a separate detailed example of nested loops.

## Summary

> [!summary]
> `if` chooses by condition, `case` chooses by value, `loop` and `for` repeat actions a specified number of times, `while` tests the condition before repetition, and `repeat ... until` tests it afterward. All substantive sections of the course notes and their concluding loop table have been covered.
