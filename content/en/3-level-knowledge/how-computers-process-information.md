---
draft: false
modified: 2026-10-18 17:16:52+03:00
created: 2026-10-17 18:17:06+03:00
version: '1.0'
up:
- '[[computer-architecture-fundamentals|Computer architecture fundamentals]]'
title: How Computers Process Information
moc: true
tags:
- area
translationKey: rabota-kompyutera-s-informatsiey
---
Information is knowledge about something. For example: the text of a Telegram message, music in headphones, or a video on YouTube.

People perceive information through their senses: their eyes, ears, skin, and so on. A computer stores and processes data as sequences of zeros and ones (0 and 1). A single 0 or 1 is a bit. Eight bits make a byte.
A device represents zeros and ones using physical states. The exact method depends on the device: electronic circuits, for example, use electrical signals. The meaning of a bit sequence depends on the rules by which a program reads the data.

## Binary representation of information
For a computer to understand information, it has to be translated into the computer's language. This uses **encoding** and **decoding**.
### Encoding
**Encoding** converts data into a [[binary-number-system|form a computer can understand]]. It translates information into a form that can be stored and processed.

**Text encoding.**
For example, the letter `A` becomes `01000001` when encoded in ASCII.
Another example: when we type a word in a text editor, the program stores the codes of its letters. When we open the file, the program reads those codes and displays letters on the screen. If a text file is saved in one encoding and read in another, incomprehensible characters—the familiar “mojibake”—may appear instead of letters.

A separate case is the `cat` command on a PDF file. It outputs the file contents to the terminal as-is, so strange characters can appear among readable fragments. The reason is the structure of PDF: it can contain service and compressed data. This is not an example of a text-encoding error.

Another example of encoding is a **source-code file in [[pascal-programming-language|Pascal]]**. It is a text file: its letters, digits, and symbols are stored as bytes. If the file is saved in UTF-8, the editor and compiler must read those bytes according to UTF-8 rules to obtain the intended characters.

The compiler then parses the resulting text according to Pascal rules and converts the program into another representation—for example, machine instructions or intermediate code. In this sense, a **compiler is one type of translator**.

**Image and video encoding**
A digital photograph can be represented as a grid of small dots—**pixels**. The computer stores information about the color of every dot.
Video consists of a sequence of images—**frames**. When many frames are shown one after another per second, we see motion. Video size therefore depends on frame size, color information, frames per second, and duration.

**Sound encoding** — [[how-sound-becomes-numbers]]
Sound changes continuously. To record it, a computer measures the sound signal many times per second. Each measurement is stored as a number.

### Decoding
The reverse conversion is **decoding**. For example, `01000001` is converted back into the letter `A`.

## Information compression
Recall video encoding:
> Video consists of a sequence of images—**frames**. When many frames are shown one after another per second, we see motion. Video size therefore depends on frame size, color information, frames per second, and duration. **In practice, video is almost always compressed; otherwise files would be very large**.

Compression makes it possible to store or transmit data in a smaller volume. A program looks for a shorter way to write it. For example, instead of a long sequence of identical values, it can store the value itself and the number of repetitions.

There are two main variants:
- **Lossless compression** makes it possible to restore original data exactly. This matters for program text, a document, or an archive: if even part of the content changes during restoration, the file may become invalid.
- **Lossy compression** removes some details for a smaller size. The original data can no longer be restored exactly. This is often suitable for photographs, music, and video if the loss of detail remains acceptable to a person.

For example, you send a photograph in a messenger. The application may reduce its size so it sends faster and takes less space for the recipient. If you zoom in afterwards, small details may look worse than in the original. When sending the same photograph as a file, the application may preserve its original quality—the exact behavior depends on its settings.
### Fano condition
The Fano condition is a rule for a set of codes of different lengths: no symbol code may be the beginning of another symbol code. Then, when codes are read in sequence, it is immediately clear where one symbol ends and the next begins.
This principle is used to build some data-compression methods. It helps encode frequently occurring elements more briefly and then read the resulting bit sequence unambiguously.

Imagine that every letter has been assigned a code of zeros and ones and the codes are then written one after another with no spaces. The recipient must understand where one letter ends and the next begins. A problem arises if one letter has code `10` and another has `101`: after reading `10`, the recipient does not yet know whether it is a complete letter or the beginning of a longer code.

The Fano condition solves this problem.
## Analog and discrete information
Signals and data can be represented in **analog** or **discrete** form. ^bvidl7

**An analog representation** changes smoothly and can take any number of intermediate values. Examples include changes in air temperature, the position of a clock hand, and the sound vibrations of a human voice.

**A discrete representation** consists of separate, clearly defined values and elements. For example, digital cameras represent an image with pixels, while sound on a compact disc is recorded as separate numerical values.
### Sampling
To let a computer work with analog sound or an image, they are converted into discrete form; this process is called **sampling**.
For example, this is how a Telegram voice message is sampled:

> A computer measures the sound signal many times per second. The exact number of measurements depends on the device and recording settings—[[how-sound-becomes-numbers]].

- A microphone converts sound vibrations into an electrical signal.
- A computer measures that signal at equal time intervals and stores the results as numbers.
- During playback, the computer uses the stored numbers to create a signal for the speaker, and we hear sound.
## Quantization
The process of rounding measured values to one of the available levels.

For example, a measured temperature of `20.37 °C` may be represented as `20.4 °C`. The more available values there are, the more accurately the original signal can be represented.
## Summary
The main point: information can exist in different forms, but for storage and processing in a computer it is represented digitally—as sequences of zeros and ones.
- [[why-computers-use-zero-and-one]]
