---
draft: false
translationKey: cdn
date: 2024-01-06T00:18
updated: 2026-04-02 13:05:39+03:00
tags: null
up:
- '[[network-security]]'
title: Content Delivery Network (CDN)
---

A content delivery network (CDN) is a geographically distributed group of servers that cache content near end users. It speeds up delivery of static resources such as HTML, JavaScript, and CSS, and can help defend against DDoS attacks.

Without a CDN, a request looks like this:

```
[ User ]
    ↓
(Internet)
    ↓
[ Origin server ]
```

With a CDN:

```
     [ User ]
        ↓
   [ CDN edge ]
     ↓     ↓
  (cache) (proxy)
        ↓
 [ Origin server ]
```

A CDN is not the primary home of business logic or data, although it can proxy APIs and run some logic at the edge. It can also act as a shield for the origin server:

- Conceal the origin IP address.
- Filter traffic.
- Absorb DDoS traffic.
- Apply rate limits and WAF rules.
