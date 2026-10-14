---
translationKey: gitlab-runner
tags: null
up:
- '[[tools-and-technologies]]'
version: '0.1'
modified: 2026-10-12 19:57:02+03:00
created: 2026-10-08 19:15:38+03:00
title: GitLab Runner
---

## Scopes

## Executors

An executor determines where and how a job runs. By analogy with RabbitMQ, a GitLab Runner is a consumer listening for jobs, while its executor is the engine that carries out a received job in a particular environment.

### Execution environments

**Docker** runs each job in a separate container and supports images and services.

**Kubernetes** creates a pod with a build container and services for each job.

**Shell** runs commands locally on the Runner host, without container isolation.

**Docker Autoscaler** creates instances according to demand through Fleeting, then runs jobs in Docker containers.

**Instance executor** creates autoscaled instances and runs each job directly on the host instance.

**SSH** runs jobs remotely over SSH; it is in maintenance mode.

**VirtualBox** clones or starts a VirtualBox VM and connects to it over SSH; it is in maintenance mode.

**Parallels** uses a Parallels VM and SSH; it is in maintenance mode.

**Custom** delegates preparation and execution to an external driver; it is in maintenance mode.

**Docker Machine** (`docker+machine`) is an older, deprecated autoscaling executor.
