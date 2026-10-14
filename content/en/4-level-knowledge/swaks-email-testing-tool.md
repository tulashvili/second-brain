---
translationKey: swaks-prostoy-klient-dlya-otpravki-pisem-s-servera
title: 'Swaks: A Tool for Sending Test Email'
tags:
- mail
- url
up:
- '[[tools-and-technologies]]'
- '[[labs-and-practical-guides]]'
dg-publish: false
date: 2025-03-11T17:58
updated: 2026-04-05 11:23:12+03:00
---

Install Swaks from the standard Ubuntu repository.

Example:

```shell
swaks --to recipient@example.com --from noreply@example.com --server 127.0.0.1
=== Trying 127.0.0.1:25...
=== Connected to 127.0.0.1.
<-  220 mail.example.com ESMTP Exim 4.93 Ubuntu
 -> EHLO mail.example.com
<-  250-mail.example.com Hello localhost [127.0.0.1]
<-  250-STARTTLS
 -> MAIL FROM:<noreply@example.com>
<-  250 OK
 -> RCPT TO:<recipient@example.com>
<-  250 Accepted
 -> DATA
<-  354 Enter message, ending with "." on a line by itself
 -> To: recipient@example.com
 -> From: noreply@example.com
 -> Subject: test
 ->
 -> This is a test mailing
 -> .
<-  250 OK
 -> QUIT
<-  221 mail.example.com closing connection
=== Connection closed with remote host.
```
