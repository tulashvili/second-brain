---
draft: false
translationKey: osi
date: 2024-01-06T00:20
updated: 2026-04-05 14:11:37+03:00
tags: null
up:
- '[[networks-and-protocols]]'
title: OSI Model
---

> [!tldr] In brief
> The OSI model describes data transfer across seven layers, from application data to bits.

The OSI model is a theoretical reference model describing what happens when data is sent and received.

## Example: data representation

At layer 7, information is represented as application data; at layer 1, it is represented as bits. The upper layers, 5 through 7, work with the data in its application-facing form.

## Groups of layers

The seven OSI layers can be roughly grouped as follows:

- **Media layers** (physical, data link, and network) carry information over cables or wireless links. Network devices such as switches and routers operate primarily here.
- **Layer 4, transport**, connects the lower and upper layers.
- **Host layers** (session, presentation, and application) operate on end-user devices such as computers and phones.

Some modern devices, including web and network filters, work across several layers.

See also [[osi-physical-layer|The Physical Layer of the OSI Model]].

## In summary

Media layers carry information, transport connects the groups, and upper layers work on the host.
