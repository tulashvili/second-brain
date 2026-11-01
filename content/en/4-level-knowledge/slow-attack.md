---
draft: false
translationKey: slow-attack
type: null
state: null
pattern:
- '[[DoS-атака|DoS attack]]'
date: 2026-03-20T00:38
updated: 2026-04-07 21:13:28+03:00
tags: null
up:
- '[[attacks-and-threats|Attacks and threats]]'
url:
- '[[Мистер Робот|Mr. Robot]]'
title: Slow Attack
version: '0.05'
---

> [!tldr] In brief
> A slow attack keeps HTTP connections open with slow requests and consumes server resources.

A slow attack, also called a *low-and-slow* attack, is a DoS attack against a web server. The attacker sends valid HTTP requests very slowly, keeping connections open for as long as possible.

## Effect on the server

This can exhaust the server's connection pool and make it unavailable to legitimate users.

- The server may fail before Nginx does if file descriptors are exhausted; check the limit with `ulimit -n`.
- Nginx itself may also run out of capacity through [[nginx-worker-process|worker processes]] and [[03 Resources/IT/Infra/Nginx/nginx worker_connections|nginx worker connections]].

## Subtypes

This is a broad family of attacks at the [[L7 Прикладной|L7 application]] layer. [[rudy-r-u-dead-yet|R.U.D.Y.]] is one subtype.

## In summary

Connection and file-descriptor limits determine where resources are exhausted.
