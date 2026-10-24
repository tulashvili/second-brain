---
draft: false
translationKey: proxmox
type: null
state: null
pattern: null
url: null
updated: 2026-04-20 20:04:26+03:00
tags: null
up:
- '[[infrastructure-and-platforms]]'
check_before_public: false
date: 2026-04-15 13:16:55+03:00
title: Proxmox
---

I had never worked with Proxmox in almost three years as a system administrator. To catch up, I installed it on the computer I bought for my homelab.

Proxmox is a virtualization platform: it lets you create and manage virtual machines with different operating systems on one physical machine.

```text
[ Hardware ]
     ↓
[ Proxmox ]
     ↓
[ VM: Ubuntu ]
[ VM: Windows ]
[ VM: Firewall ]
```

By contrast, a conventional Ubuntu installation looks like this:

```text
[ Hardware ]
     ↓
[ Ubuntu ]
     ↓
[ nginx / docker / app ]
```

## My first installation

1. I downloaded `proxmox.iso` from the [official site](https://www.proxmox.com/en/downloads) and wrote it to a USB drive with [[balenaetcher|balenaEtcher]].
2. I enabled `Intel Virtualization Technology` in the BIOS before installing:
   ![[Pasted image 20260415133210.png|584]]

   Without it, I got this installation error:
   ![[Pasted image 20260415132924.png|589]]
3. I chose *Install Proxmox VE (Graphical)*:
   ![[11fde1d8ecf9fbb125152fd9c7808e8a82cc93ef399634fb4571601f39884666.jpeg|589]]
4. I followed the remaining installer prompts:
   ![[Pasted image 20260415133540.png|585]]

## What I did first

1. I saved the address and password for the web interface in a secure place.
2. I added my public SSH key to the machine with `ssh-copy-id` so I could sign in with the key.

> [!NOTE] Repository licensing
> Proxmox enables enterprise repositories by default. Without an [enterprise subscription](https://www.proxmox.com/en/products/proxmox-virtual-environment/pricing), I needed to enable the no-subscription repository before updating the host.

3. I removed the enterprise repository definitions from `/etc/apt/sources.list.d`:
   1. Removed `ceph.sources` and `pve-enterprise.sources`.
   2. Created `pve-no-subscription.list` with `deb http://download.proxmox.com/debian/pve trixie pve-no-subscription`.
   3. Ran `apt update`, `apt list --upgradable`, then `apt upgrade`.
