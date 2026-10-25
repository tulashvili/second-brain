---
translationKey: out-of-memory-oom
created: 2024-05-24T19:07
updated: 2026-04-23 17:38:08+03:00
title: Out of Memory (OOM)
date: 2024-05-24T18:07
description: null
draft: false
tags: null
up:
- '[[infrastructure-and-platforms]]'
---

> [!tldr] In brief
> OOM occurs when processes demand more memory than the system has available.

When running processes and applications demand more memory than is available, the operating system may choose a process to terminate so the system can recover.

As a result, services on a server may stop working, the server may become overloaded or unresponsive, and an **out of memory (OOM)** error may appear.

## Example log entry

The termination is recorded in system logs, often under `/var/log/`. An example message looks like this:

```text
Jul 11 17:12:34 ovzhost114 kernel: [63353551.892881] Out of memory in UB 33222955: OOM
```

## In summary

A system log message can reveal that an out-of-memory event occurred.
