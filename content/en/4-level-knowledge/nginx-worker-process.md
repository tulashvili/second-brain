---
draft: false
translationKey: nginx-worker-process
type: null
state: null
pattern: null
url: null
updated: 2026-04-07 21:07:13+03:00
tags: null
up:
- '[[infrastructure-and-platforms]]'
date: 2024-10-21
title: Nginx Worker Process
---

`worker_processes` is one of the key Nginx performance settings. It controls how many Nginx worker processes run at the same time.

- `auto` sets the worker count to the number of CPU cores; this is a common choice.
- An explicit number `n` runs exactly that many workers, even if the host has more cores.
