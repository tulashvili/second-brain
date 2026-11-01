---
draft: false
modified: 2026-10-18 22:39:34+03:00
created: 2026-10-18 16:34:16+03:00
version: '0.1'
up:
- '[[pascal-programming-language|Pascal programming language]]'
title: Variables and Data Types in Pascal
translationKey: peremennye-i-tip-dannyh-v-pascal
---
A **variable** is a named place for a value that can change while a program runs. It is declared after `var`, with a name and type. You can use different names, such as `age`, `total`, or `number1`.
```pascal
var
  count: integer;
  temperature: real;
  answer: boolean;
```

A **data type** determines what values can be placed in a variable and which operations are available for them.

```pascal
var
    age: integer;
    price: real;
    isReady: boolean;
```
Here, `age` stores an integer, `price` a number with a fractional part, and `isReady` a Boolean value: true or false. Declaring variables helps describe in advance the data with which the program will work.

You can declare several variables of the same type on one line, listing them with commas:
```pascal
var
  x, y, result: integer;
```

If a value must not change while the program runs, use a **constant**. It is declared after `const`:
```pascal
const
  Gravity = 9.81;
```
The constant name makes code clearer: the acceleration due to gravity on Earth is approximately 9.81.
