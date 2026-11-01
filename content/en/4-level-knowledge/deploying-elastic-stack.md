---
draft: false
type: null
state: null
pattern: null
url: null
updated: 2026-04-20 20:03:07+03:00
tags: null
up:
- '[[logging-monitoring-and-threat-detection|Logging monitoring and threat detection]]'
- '[[labs-and-practical-guides|Labs and practical guides]]'
check_before_public: false
date: 2026-04-16 18:45:06+03:00
title: Deploying Elastic Stack
version: '0.1'
translationKey: razvertyvanie-elastic-stack
---

> [!tldr] In brief
> This note records two deployment failures: the Kibana account and the agent’s Elasticsearch address.

I will not recount every step of the last two days; the path was too thorny. Instead, I want to record what worked, what failed, and what to check if I deploy Elastic Stack again. This is from memory, so I hope I have not missed anything. 🫠

I used Docker Compose to deploy the Elastic Stack components. I also enjoyed working with Docker much more than I expected. 🤔

## Problem 1: `elastic user is forbidden`

### What I did

Started Elasticsearch and Kibana with Docker Compose.

### What happened

Kibana stopped with:

```sh
elastic user is forbidden
```

### Why

I had set `ELASTICSEARCH_USERNAME=elastic` in `docker-compose.yml`. In newer versions, Kibana [cannot use the `elastic` user](https://discuss.elastic.co/t/kibana-error-fatal-error-config-validation-of-elasticsearch-username-value-of-elastic-is-forbidden/297956); it needs a dedicated service account.

### What helped

```yaml
services:
  elasticsearch:
    # ...
  kibana:
    # ...
    environment:
      - ELASTICSEARCH_USERNAME=kibana_system
```

## Problem 2: No logs in Kibana

### What I did

After starting Elastic Stack (Elasticsearch, Kibana, Fleet Server), I opened Kibana's Discover interface to inspect logs.

Before that, I had:

- deployed Fleet Server;
- created an agent policy;
- installed Elastic Agent on remote hosts;
- added the System, Nginx, and Auditd integrations.

### What happened

`logs-*` was empty, while `metrics-*` had data. Something was collecting data, but the logs were not reaching Elasticsearch.

### What I checked

#### 1. Basic checks

- Kibana integrations;
- `elastic-agent status` → `HEALTHY`;
- Filebeat processes, to see whether it had started:

```bash
ps aux | grep filebeat
lsof -p <filebeat_pid>
```

I also tried restarting the agent:

`systemctl restart elastic-agent` — after this, Filebeat began reading the file, but logs still did not appear in Kibana.

#### 2. Checking the agent

Finally, I inspected the agent configuration:

```sh
elastic-agent inspect components --show-config
```

I found:

```
hosts: http://localhost:9200
```

That was the root cause.

### Why

When I started the Elasticsearch Docker container, I had closed external access to port 9200 for security. As it turned out, that became a problem later.

Elastic Agent was configured to send data to:

```
http://localhost:9200
```

instead of the real Elasticsearch host:

```
http://<elastic_ip>:9200
```

As a result:

- the agent sent data “to itself”;
- Elasticsearch was unavailable;
- data was lost.

### What helped

I published Elasticsearch's port in `docker-compose.yml`:

```yaml
ports:
  - "9200:9200"
```

I fixed the output in Fleet:

`Kibana → Fleet → Settings → Outputs`

```
http://<elastic_ip>:9200
```

## In summary

Both problems were localized by observing the result and checking the effective configuration.
