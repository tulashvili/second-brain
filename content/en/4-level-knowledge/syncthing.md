---
translationKey: syncthing
title: Syncthing
type: null
pattern: null
url: null
updated: 2026-04-24 13:24:54+03:00
tags:
- self_hosted
up:
- '[[infrastructure-and-platforms]]'
check_before_public: null
date: 2026-04-22 08:10:27+03:00
---

[Official website](https://syncthing.net/)

## Installation and basic setup

```sh
brew install syncthing
brew services start syncthing
```

1. Open `http://127.0.0.1:8384/`.
2. Add a new device.
3. Add a folder to synchronize. Enable file versioning when you create it.
4. On the target device from step 2, accept the connection and folder-sharing requests. Enable versioning there as well.

## Ignoring files and directories

I needed to reduce the load on my phone when opening my Obsidian vault. The startup report showed that plugins and settings consumed almost half the startup time:

```text
Obsidian start-up time breakdown

Obsidian version: 1.12.7 (303)
API version: 1.12.7
Operating system: Android 16 (Xiaomi 2406APNFAG)
Webview version: 147.0.7727.55

- Total startup time: 14 312ms
- Initialization: 638ms
- Vault (4 352 files): 7 140ms
- Workspace (7 tabs, 7 deferred): 204ms
- Core plugins: 163ms
- Community plugins (25 active): 6 168ms
  - Tasks (7.23.1): 1 251ms
  - Copilot (3.2.7): 946ms
  - Excalidraw (2.20.2): 543ms
  - Markmind (3.4.3): 403ms
  - Omnisearch (1.28.2): 381ms
  - Folder notes (1.8.18): 214ms
  - Emoji Toolbar (1.0.0): 183ms
  - Jira Issue (1.58.1): 156ms
  - Style Settings (1.0.9): 154ms
  - Raindrop Highlights (0.0.24): 134ms
  - Dataview Publisher (0.3.10): 130ms
  - Minimal Theme Settings (8.2.1): 130ms
  - Advanced Tables (0.22.1): 116ms
  - Update modified date (1.5.2): 111ms
  - Dataview (0.5.68): 108ms
  - Highlightr (1.2.2): 97ms
  - Templater (2.18.1): 58ms
  - Tag Wrangler (0.6.4): 58ms
  - Find orphaned files and broken links (1.10.1): 50ms
  - Image Context Menus (1.11.2): 49ms
  - Natural Language Dates (0.6.2): 49ms
  - Better Search Views (0.3.0): 34ms
  - Outliner (4.9.0): 34ms
  - Regex Find/Replace (1.2.0): 33ms
  - Copy Block Link (1.0.4): 16ms
```

In Syncthing, open the settings for the synchronized folder:

![[Pasted image 20260424130923.png|493]]

Make the corresponding changes on the phone too.

### Ignore-pattern examples

- Ignore `MyFolder` at the folder root: `MyFolder`
- Ignore `MyFolder` at any depth: `**/MyFolder`
- Ignore files ending in `.tmp`: `*.tmp`
- To exclude `MyFolder` but include `MyFolder/important`, use the appropriate ordered ignore patterns for those paths.
