# Four-level content hierarchy design

## Goal

Make the vault visibly navigable from broad knowledge areas down to atomic notes without changing the established flat public URLs.

## Hierarchy

The homepage `content/index.md` remains the site entry point outside the numbered folders.

1. `content/1-level-knowledge/` contains root knowledge-area MOCs.
2. `content/2-level-knowledge/` contains the main directions within a root area.
3. `content/3-level-knowledge/` contains thematic MOCs.
4. `content/4-level-knowledge/` contains atomic notes.

The initial root areas are `Основы информационной безопасности` and `Linux`. Existing security-area MOCs become children of `Основы информационной безопасности`; `Процессы в Linux` becomes a child of `Linux`.

## Navigation model

The physical level expresses the role of a file. YAML `up` links remain the authoritative semantic graph and may contain multiple parents. Every non-homepage MOC and every atomic note must have at least one valid MOC parent. The homepage links only to level-1 areas; each MOC lists its immediate key topics.

## Routing

Folder names are authoring-only organization. Published content routes remain flat and retain the existing basename-derived ASCII slugs. A build must reject two source files that would collapse to the same flat route.

## Validation

Tests must discover content recursively, assert the expected file role in each numbered folder, validate the complete MOC graph, verify unique flat slugs, and build the generated site with flat canonical routes and resolving internal links.

## Constraints

- Preserve existing article bodies and unrelated working-tree changes.
- Do not enable public folder pages or the Explorer as part of this migration.
- Do not commit, push, deploy, or publish.
