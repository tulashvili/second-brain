---
draft: false
modified: 2026-10-18 22:53:19+03:00
created: 2026-10-15 11:24:20+03:00
version: '0.01'
up:
- '[[application-and-web-service-security|Application and web service security]]'
title: Nginx Request Rate Limiting
translationKey: module-ngx-http-limit-req-module
---
https://nginx.org/en/docs/http/ngx_http_limit_req_module.html

- There are definitely notes about it in Personal MCP.

| Limit | What it protects against | What it can miss |
| --- | --- | --- |
| `30r/s` per IP, `burst=150` | One active IP | A distributed attack from many IPs |
| `500r/s` per host, `burst=1000` | A large aggregate attack | A moderate distributed flow below 500 RPS |
