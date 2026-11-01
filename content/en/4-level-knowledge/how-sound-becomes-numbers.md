---
draft: false
version: '0.1'
title: How Sound Becomes Numbers
tags: null
up:
- '[[physics-fundamentals|Physics fundamentals]]'
- '[[programming-fundamentals|Programming fundamentals]]'
- '[[how-computers-process-information|How computers process information]]'
dg-publish: false
dg-note-icon: null
created: 2025-12-21T15:28
modified: 2026-10-18 22:27:24+03:00
published_in: null
url: null
translationKey: kak-zvuk-kompyutera-stanovitsya-chislami
---
There was a time when I used FL Studio actively, but I never thought about how the program or sound itself worked. After immersing myself in programming over the past year and a half, it is time to catch up.

First, let us look at what sound is and how a computer digitizes it.

## What sound is

First, let us understand what sound actually is.

In the real world, sound is **air vibration**. When we clap, talk, or strike a guitar string, the air around us begins to vibrate. These vibrations travel through space and eventually reach our ears.

The ear catches these vibrations, and we hear sound.

The important point is that in the analog, physical world sound is a **continuous wave**. It does not consist of separate steps or points; it flows smoothly without stopping.

![[assets/Pasted image 20251221161328 1.png]]

## Digitizing sound

A computer is different. It does not understand waves, air, or vibration. It can only work with numbers—at the most basic level, 0 and 1.

So for a computer to “understand” sound, it must **translate it from the language of waves into the language of numbers**.

How does that happen?

The computer does something very simple but important: it **measures the current height of the sound wave many times per second**. This process is called **sampling**. Put simply:

> A computer does not store the entire wave; it stores it as a sequence of measurements.

**How many times per second is “many”?** The most common value is **44,100 times per second** (44.1 kHz).

This number is not arbitrary. It relates to the **Nyquist–Shannon theorem**, but the essence can be explained without mathematics:

- The human ear hears sounds up to approximately **20 kHz**.
- To record such a wave correctly, you need to measure it **at least twice as often** as its highest frequency.

If you measure too infrequently:

- wave peaks are lost;
- the signal shape is distorted;
- the sound is recorded incorrectly.

Therefore:

- 20 kHz is the upper hearing limit;
- ~40 kHz is the minimum acceptable measurement frequency;
- **44.1 kHz** is a safe standard with some margin.

> I remember seeing this number in Windows settings before, somewhere in the “sound format” drop-down. At the time it meant nothing to me. Now it is clear: this is literally **the rate at which a computer “looks” at sound**.

## In summary

- In the real world, sound is a **continuous wave**.
- A computer does not understand waves.
  - It **measures** the wave many times per second.
  - The result is a set of numbers.
  - The more frequent the measurements, the more accurate the sound.

The next part will cover why sound is not just numbers.

## Sources

https://www.researchgate.net/figure/Sampling-of-audio-signal_fig3_266488076
https://majormixing.com/audio-sample-rate-and-bit-depth-complete-guide/
https://finalyearresearch.wordpress.com/2012/02/28/sound-waves
