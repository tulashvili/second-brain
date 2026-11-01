---
draft: false
modified: 2026-10-18 22:50:20+03:00
created: 2026-10-18 22:46:07+03:00
version: '0.01'
up:
- '[[infrastructure-and-platforms|Infrastructure and platforms]]'
title: Mail Server
translationKey: pochtovyy-server
---
A **mail server** means a program such as Exim or Postfix (an MTA) that accepts and transfers email between servers, usually through SMTP on port 25.

The process of sending an email looks like this:
1. When a user sends an email from a client—Thunderbird, Proton Mail, and so on—it goes to a mail server, usually through port 587 or 465.
2. The server then prepares the message for delivery. During preparation, it adds a `DKIM-Signature` header by creating a signature with the private key of the `example.com` domain. The header also indicates the domain and key selector.
