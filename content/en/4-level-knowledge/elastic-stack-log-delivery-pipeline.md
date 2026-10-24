---
draft: false
translationKey: tsepochka-dostavki-logov-s-ispolzovaniem-elastic-stack
type: null
state: null
pattern:
- '[[Elastic Stack]]'
- 'Monitoring'
url: null
updated: 2026-04-16 18:48:24+03:00
tags:
- monitoring
up:
- '[[detection-logging-and-monitoring]]'
check_before_public: null
date: 2026-04-16 17:56:33+03:00
title: A Log Delivery Pipeline with Elastic Stack
---

[[elastic-stack|Elastic Stack]] is a set of components for tracking, analyzing, and monitoring logs.

## The delivery chain

![[Pasted image 20260416180854.png]]

1. A log file produces events.
2. A [[log-collector|log collector]] gathers them.
3. The collector sends the logs to Elasticsearch.
4. Kibana visualizes them.
