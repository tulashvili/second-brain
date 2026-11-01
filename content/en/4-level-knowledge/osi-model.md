---
draft: false
translationKey: osi
date: 2024-01-06T00:20
updated: 2026-04-05 14:11:37+03:00
tags: null
up:
- '[[networks-and-protocols|Networks and protocols]]'
title: OSI Model
version: '0.05'
---

> [!tldr] In brief
> The OSI model describes data transfer across seven layers, from application data to bits.

The OSI model is a theoretical reference model describing what happens when data is sent and received.

## Example: data representation

At layer 7, information is represented as application data; at layer 1, it is represented as bits. The upper layers, 5 through 7, work with the data in its application-facing form.

## Groups of layers

The seven OSI layers can be roughly grouped as follows:

- **Media layers** (layers of the medium—[[osi-physical-layer|Physical layer]], [[L2 Канальный|L2 Data Link]], [[L3 Сетевой|L3 Network]])
  - Carry information over cables or wireless networks
  - Are used by network devices such as switches and routers
  - Are implemented on network devices, although devices able to work at every layer have now begun to appear; web and network filters are examples
- [[L4 Транспортный|L4 Transport]] is an intermediary between the groups of layers
- **Host layers** (host layers—[[L5 Сеансовый|L5 Session]], [[L6 Представления|L6 Presentation]], [[L7 Прикладной|L7 Application]])
  - Are used directly on devices such as desktop computers or mobile devices

## In summary

Media layers carry information, transport connects the groups, and upper layers work on the host.
