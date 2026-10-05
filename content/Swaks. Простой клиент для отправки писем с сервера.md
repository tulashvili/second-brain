---
title:
tags:
  - mail
  - url
  - public
dg-publish: false
date: 2025-03-11T17:58
updated: 2026-04-05T11:23:12+03:00
---
Установка стандартная, из репозитория Ubuntu.

Пример:
```shell
otulashvili@h3-<project> [<project>] :~ $ swaks --to my_email@gmail.com --from noreply@<domain>.com --server 127.0.0.1
=== Trying 127.0.0.1:25...
=== Connected to 127.0.0.1.
<-  220 h3-<project>.dio ESMTP Exim 4.93 Ubuntu Tue, 11 Mar 2025 17:55:33 +0300
 -> EHLO h3-<project>.dio
<-  250-h3-<project>.dio Hello localhost [127.0.0.1]
<-  250-SIZE 52428800
<-  250-8BITMIME
<-  250-PIPELINING
<-  250-CHUNKING
<-  250-STARTTLS
<-  250-PRDR
<-  250 HELP
 -> MAIL FROM:<noreply@<domain>.com>
<-  250 OK
 -> RCPT TO:<my_emailgmail.com>
<-  250 Accepted
 -> DATA
<-  354 Enter message, ending with "." on a line by itself
 -> Date: Tue, 11 Mar 2025 17:55:33 +0300
 -> To: omartulashvili.ge@gmail.com
 -> From: noreply@<domain>.com
 -> Subject: test Tue, 11 Mar 2025 17:55:33 +0300
 -> Message-Id: <20250311175533.4171711@h3-<project>.dio>
 -> X-Mailer: swaks v20190914.0 jetmore.org/john/code/swaks/
 -> 
 -> This is a test mailing
 -> 
 -> 
 -> .
<-  250 OK id=1ts113-00HVFh-5V
 -> QUIT
<-  221 h3-<project>.dio closing connection
=== Connection closed with remote host.

```
