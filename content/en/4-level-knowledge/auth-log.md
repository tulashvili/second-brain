---
translationKey: auth-log
type: null
state: null
pattern: null
url: null
updated: 2026-04-06 15:19:32+03:00
date: 2026-04-06 13:33:05+03:00
tags: null
up:
- '[[detection-logging-and-monitoring]]'
- '[[authorization-and-authentication]]'
title: auth.log
---

The `auth.log` file records who tried to sign in to our server and when.

It contains useful details such as:

- When the authentication attempt happened.
- Whether it succeeded.
  - If it did, whether the user signed in with a password or an SSH key.
  - If an SSH key was used, which key and file it came from (for example, `Accepted key RSA SHA256:<sha256> found at /etc/ssh_keys/<user>:1`).
