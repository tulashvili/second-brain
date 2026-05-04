---
title:
type:
Область:
Родитель:
url:
updated: 2026-04-24T13:24:54+03:00
tags:
  - self_hosted
  - public
check_before_public:
date: 2026-04-22T08:10:27+03:00
---
[Веб-сайт](https://syncthing.net/)

## Установка и базовая настройка
```sh
brew install syncthing
brew services start syncthing
```

1) Переходим http://127.0.0.1:8384/
2) Добавить новое устройство
3) Добавить диру для отслеживания
	- не забыть включить версионирование в диалоговом окне при создании директории
4) Перейти на целевое устройство из п.2
5) Там принять запрос на подключение и добавление новой директории
	- не забыть включить версионирование в диалоговом окне при принятии директории

## Игнорирование директорий/файлов
```sh
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

Понадобилось в рамках [[Тяжело справляться телефону с 6000 файлами|уменьшения нагрузки на телефон при открытии файлов]] убрать плагины и настройки, тк они занимали очень много времени для открытия (буквально, половину времени!)

В syncthing открываем настройки синхронизируемой директории:
![[Pasted image 20260424130923.png|493]]

Тоже самое делаем и на телефоне

### Примеры
- **Игнорировать папку `MyFolder`:**
    `MyFolder`
- **Игнорировать папку `MyFolder` на любом уровне:**
    `**/MyFolder`
- **Игнорировать все папки с именем `temp`:**
    `temp`
- **Игнорировать все файлы с расширением `.tmp`:**
    `*.tmp`
- **Игнорировать папку `MyFolder`, но включить папку `MyFolder/important`:**
    `MyFolder !MyFolder/important`




