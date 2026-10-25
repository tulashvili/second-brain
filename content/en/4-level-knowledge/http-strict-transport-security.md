---
draft: false
translationKey: hsts-http-strict-transport-security
up:
- '[[application-and-web-service-security]]'
- '[[network-security]]'
title: HTTP Strict Transport Security (HSTS)
---

> [!tldr] In brief
> After a secure connection, HSTS makes the browser use HTTPS directly on later visits.

Note version: **0.1, 9 October 2026**

## Example: two entrances

Imagine an office with two entrances.

The first is an ordinary entrance with no checks. That is HTTP.

The second is protected by a turnstile, a guard, and a pass. That is HTTPS.

A guard can put a sign on the ordinary entrance saying, “Please use the protected entrance.” On the web, an HTTP-to-HTTPS redirect plays a similar role.

But if a visitor has already reached the unprotected entrance and opened the door, an attacker may meet them there and send them somewhere else.

HSTS helps with this problem. After visiting the protected entrance once, the browser remembers:

> There is no ordinary entrance for this address. Always use the protected one.

On the next visit, the browser does not even try to send an HTTP request. It uses HTTPS immediately.

## The first-visit limitation

> [!warning]
> HSTS has a limitation: the browser usually learns about the policy only after the first successful HTTPS connection. HSTS Preload can protect that first visit, but it is a separate and much more consequential decision. Do not add `preload` just in case: if the domain's certificate expires, the site may become unavailable, and the setting cannot be undone quickly.

## In summary

A redirect sends HTTP traffic to HTTPS; HSTS helps the browser avoid starting the next visit over HTTP.
