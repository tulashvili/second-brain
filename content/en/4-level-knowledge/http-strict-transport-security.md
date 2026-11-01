---
draft: false
version: '0.1'
up:
- '[[application-and-web-service-security|Application and web service security]]'
- '[[network-security|Network security]]'
modified: 2026-10-25 16:35:33+03:00
created: 2026-10-09 12:51:28+03:00
title: HSTS (HTTP Strict Transport Security)
translationKey: hsts-http-strict-transport-security
---

> [!tldr] In brief
> After the first secure connection, HSTS makes the browser go directly to the site over HTTPS.

## Example: two entrances

Imagine an office with two entrances.

The first entrance is ordinary, with no checks. This is HTTP.

The second is protected, with a turnstile, guards, and a pass. This is HTTPS.

A guard can hang a sign at the ordinary entrance: “Please use the protected entrance.” On the web, an HTTP-to-HTTPS redirect plays this role.

If a visitor has already approached the unprotected entrance and opened the door, an attacker may be able to meet them and send them somewhere other than where they intended to go.

HSTS helps solve this problem: after visiting the protected entrance once, the browser remembers:

> For this address, the ordinary entrance does not exist. Always use the protected one.

On the next visit, the browser does not even try to send an HTTP request. It uses HTTPS immediately.

## First-visit limitation

> [!warning]
> HSTS has a limitation: a browser usually learns about it only after the first successful HTTPS connection. HSTS Preload exists to protect that very first visit, but it is a separate and much more serious decision. You must not add `preload` “just in case,” because if the domain certificate expires, the site becomes unavailable and the setting cannot be quickly undone.

## Summary

A redirect leads from HTTP to HTTPS, while HSTS helps the browser avoid starting the next request with HTTP.
