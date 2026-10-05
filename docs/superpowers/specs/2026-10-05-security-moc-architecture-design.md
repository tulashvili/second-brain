# Security-first MOC architecture

## Purpose

Organize the public Second Brain as a security-first knowledge map inspired by
the navigation model of Simon Späti's Second Brain. Information security is the
primary domain. Networking, infrastructure, programming, storage, and tools
remain published as supporting domains.

The design must preserve the current 33 article URLs and the flat public route
contract. Organization is expressed through curated Map of Content (MOC) pages,
ordinary wikilinks, and `up` relationships rather than physical folders.

## Success criteria

- `/` is a useful information-security entry point rather than a site counter.
- Every one of the 33 existing articles has at least one intentional parent MOC.
- The hierarchy is understandable in Obsidian and on the Quartz site.
- MOC pages combine editorial guidance with automatically discovered children.
- Existing article URLs remain unchanged and no `/brain/` or `/tags/` routes
  return.
- Search and the sitemap contain both articles and MOC pages.
- RSS and the recent-articles block contain articles only.
- Invalid parents, unreachable MOCs, and hierarchy cycles fail validation.

## Chosen approach

Use a hybrid curated-and-generated MOC model.

Each MOC contains a short editorial introduction and a manually selected set of
key links. The complete child-note list is generated from `up` relationships.
This retains the explanatory quality of a curated vault without requiring the
same complete list to be maintained in two places.

Fully manual MOCs were rejected because every note would need duplicate edits.
Fully generated MOCs were rejected because they would become dry catalog pages
without a useful learning path.

## Route and file model

All Markdown files remain physically flat in `content/`. The existing ASCII slug
plugin continues to produce canonical flat URLs.

`content/index.md` becomes the root MOC titled `Информационная безопасность` and
continues to publish at `/`. Thirteen new MOC files are added at the root of
`content/`, so the published vault has fourteen MOCs including the home page.

MOC pages use this frontmatter shape:

```yaml
---
title: Сетевая безопасность
moc: true
tags:
  - public
  - area
up:
  - "[[Информационная безопасность]]"
---
```

The root MOC has `moc: true` but no `up`. Ordinary notes use this shape:

```yaml
---
title: Slow Attack
tags:
  - public
up:
  - "[[Атаки и угрозы]]"
---
```

Rules:

- `moc: true` is the explicit and only page-classification flag.
- `up` is the only source of hierarchical relationships.
- `down` is not maintained manually; reverse child relationships are derived.
- Existing `area` properties on ordinary notes are migrated to `up` and removed.
- Tags describe attributes such as `monitoring`, `docker`, or `tutorials`; they
  do not determine hierarchy.
- Ordinary wikilinks remain the source of lateral semantic relationships.
- Multiple parents are allowed only when a note genuinely belongs to multiple
  learning paths. The common example is a domain parent plus the cross-cutting
  practical-guides MOC.
- No empty concept stubs are created merely to fill the graph. The approved MOCs
  are allowed to begin small and grow with future notes.

## Knowledge hierarchy

The root MOC links to these primary security areas:

1. `Основы информационной безопасности`
2. `Сетевая безопасность`
3. `Атаки и угрозы`
4. `Обнаружение, логирование и мониторинг`
5. `Безопасность инфраструктуры`
6. `Безопасность приложений и веб-сервисов`
7. `Операционная безопасность и инструменты`
8. `Лаборатории и практические руководства`

Supporting areas sit below the relevant security area:

- `Сети и протоколы` has `up: [[Сетевая безопасность]]`.
- `Инфраструктура и платформы` has
  `up: [[Безопасность инфраструктуры]]`.
- `Хранение данных` has `up: [[Безопасность инфраструктуры]]`.
- `Программирование и автоматизация` has
  `up: [[Операционная безопасность и инструменты]]`.
- `Инструменты и технологии` has
  `up: [[Операционная безопасность и инструменты]]`.

`Лаборатории и практические руководства` is a cross-cutting second parent for
practical notes; it does not replace their domain parent.

## Existing-note assignment

### Сети и протоколы

- `Компьютерные сети`
- `OSI`
- `Физический уровень модели OSI`
- `LAN (Local Area Network)`
- `PAN (Personal Area Network)`
- `CAN (Campus Area Network)`
- `Коммутатор`
- `Маршрутизатор`
- `Коммутатор vs Маршрутизатор`

### Сетевая безопасность

- `Proxy`
- `CDN`

### Атаки и угрозы

- `Типы атак на информационные системы`
- `Slow Attack`
- `R.U.D.Y (R-U-Dead-Yet)`

### Обнаружение, логирование и мониторинг

- `Auth.log`
- `Elastic Stack`
- `Лог коллектор`
- `Развертывание Elastic Stack`
- `Цепочка доставки логов с использованием Elastic Stack`

### Безопасность инфраструктуры

- `SPOF`

### Инфраструктура и платформы

- `Proxmox`
- `Out of memory (OOM)`
- `nginx_worker_process`
- `Мультиконтейнерное приложение в Docker (docker network)`
- `Syncthing`
- `Как звук компьютера становится числами`

### Безопасность приложений и веб-сервисов

- `Настройка forward proxy в Nginx c basic auth`

### Хранение данных

- `Awscli`
- `Minio Client`
- `Гайд по использованию mysqldump`

### Инструменты и технологии

- `balenaEtcher`
- `Swaks. Простой клиент для отправки писем с сервера`

### Программирование и автоматизация

- `DIY-гаджет для трейдинга без эмоций`

The following practical notes also receive
`up: [[Лаборатории и практические руководства]]`:

- `Настройка forward proxy в Nginx c basic auth`
- `Развертывание Elastic Stack`
- `Мультиконтейнерное приложение в Docker (docker network)`
- `Awscli`
- `Minio Client`
- `Гайд по использованию mysqldump`
- `balenaEtcher`
- `Swaks. Простой клиент для отправки писем с сервера`

## Page experience

### Root MOC

The home page contains:

1. A short explanation of the security-focused Second Brain.
2. The eight primary security areas, each with a description and selected links.
3. The supporting areas.
4. The existing recent-article component, filtered to ordinary articles.
5. The semantic knowledge tree.

### MOC page

Each MOC contains:

- a concise explanation of the area;
- a curated `Ключевые темы` section;
- an automatically generated `Все заметки раздела` section;
- navigation to its parent MOC;
- the existing local graph and backlinks.

### Article page

Each ordinary article shows semantic parent navigation based on `up`. Multiple
parents are shown when present. Existing backlinks and the local graph remain.

The standard `@quartz-community/breadcrumbs` component is disabled because the
vault deliberately keeps files flat and that component only reflects filesystem
paths. The local `semantic-navigation` plugin becomes the visible hierarchy.

## Quartz behavior

The local `semantic-navigation` Quartz 5 plugin remains the adapter for the
Breadcrumbs-style metadata. Quartz does not execute the Obsidian Breadcrumbs
plugin. The local plugin must:

- read wikilinks from `up` in frontmatter and the existing inline syntax;
- resolve every parent to an existing published MOC;
- derive parent-to-child edges without manually stored `down` fields;
- render parent navigation on ordinary articles;
- render generated child lists on MOC pages;
- render the complete semantic tree on the root MOC;
- represent multiple parents without duplicating a note in one generated list;
- avoid infinite rendering when invalid cyclic data is encountered.

Obsidian Breadcrumbs may consume the same `up` fields locally, but it is not a
runtime dependency of the published site.

## Article, search, sitemap, and RSS classification

An ordinary published article is a visible Markdown content page that is not a
system page, flat-tag descriptor, or page with `moc: true`.

- The existing article count remains exactly 33.
- All fourteen MOCs remain searchable and appear in the sitemap.
- MOCs do not appear in the recent-articles component.
- MOCs do not appear in RSS.
- A dedicated article-only RSS path or equivalent local content-index extension
  provides the RSS behavior because the upstream Quartz content-index plugin has
  no per-page RSS filter.
- Flat-tag pages retain their existing search and canonical behavior.

## Validation and failure behavior

Knowledge-structure validation runs as part of `npm run check:site` and fails on:

- a published ordinary article without `up`;
- an `up` target that does not resolve to a published MOC;
- a non-root MOC without a parent;
- a MOC that is unreachable from the root MOC;
- a self-reference or cycle in the MOC hierarchy;
- an ordinary note that still uses the legacy `area` property;
- a MOC appearing in RSS or the recent-articles output;
- a missing MOC in search or the sitemap;
- a changed or missing canonical URL for any existing article;
- any generated `/brain/` or `/tags/` directory;
- any unresolved internal link in generated HTML.

The renderer remains defensive and finite if handed cyclic data, but cyclic data
is a build-contract violation rather than an accepted published state.

## Test strategy

Unit tests cover:

- extraction and resolution of one or multiple `up` links;
- reverse child-edge derivation;
- MOC classification;
- generated child lists;
- parent navigation;
- duplicate-edge elimination;
- missing-parent diagnostics;
- self-reference and multi-node cycle diagnostics.

Content-contract tests cover:

- exactly 33 ordinary articles and fourteen MOCs including `index.md`;
- all 33 approved assignments from this specification;
- reachability of every MOC from the root;
- removal of every legacy `area` property from ordinary articles.

Generated-site tests cover:

- unchanged flat article URLs and canonicals;
- flat MOC URLs and canonicals;
- all articles and MOCs in search and the sitemap;
- articles only in RSS and recent updates;
- working semantic parent links and generated MOC child links;
- no route redirects or nested `brain`/`tags` output.

Final verification includes `npm run check:site`, the Ansible build validator
against `public/`, and local visual inspection of the root MOC, representative
MOCs, a single-parent article, and a multi-parent practical article at desktop
and mobile widths.

## Non-goals

- Recreating the full Obsidian Breadcrumbs feature set.
- Supporting `next`, `prev`, arbitrary relationship types, Dataview queries,
  Dendron naming, Johnny.Decimal naming, Matrix view, or Canvas export.
- Moving content into physical subdirectories.
- Renaming or rewriting the body of the existing 33 articles.
- Creating placeholder concept pages solely to make the graph look fuller.
- Changing the approved typography, color palette, header, or flat-route model.
