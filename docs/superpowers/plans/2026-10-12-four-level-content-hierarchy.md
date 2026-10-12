# Four-level Content Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Organize all knowledge content into four authoring levels while preserving flat public routes and semantic MOC navigation.

**Architecture:** Numbered folders encode content role, while YAML `up` links encode graph relationships. The ASCII slug transformer flattens source paths to basename routes, and recursive tests validate both the physical placement and semantic graph.

**Tech Stack:** Markdown/YAML, TypeScript, Quartz 5, Node test runner, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-12-four-level-content-hierarchy-design.md`

## Global Constraints

- Preserve article bodies and unrelated user changes.
- Keep the homepage at `content/index.md`.
- Keep public routes flat and basename-derived.
- Do not enable Folder Page or Explorer.
- Do not commit, push, deploy, or publish.

## Review Focus

- Two nested files flattening to the same route must fail instead of silently overwriting.
- Recursive inventory must exclude `_flat-tags`, assets, and hidden support directories.
- Multi-parent `up` links must continue to resolve after physical moves.
- Existing flat canonical URLs and internal links must remain valid.
- New root areas and atomic notes must not remain disconnected from the MOC graph.

---

### Task 1: Flat route support for nested content

**Files:**

- Modify: `plugins/ascii-slug/src/slug.ts`
- Modify: `plugins/ascii-slug/src/index.ts`
- Test: `plugins/ascii-slug/src/slug.test.ts`

**Interfaces:**

- Produces: `toFlatAsciiSlug(slug: string): string` and a normalized, collision-checked `ctx.allSlugs` manifest.
- Consumed by: recursive content and generated-site tests in Tasks 2 and 4.

- [x] Add tests proving nested content paths flatten to basename routes and duplicate basenames are rejected.
- [x] Run the focused plugin test and confirm RED for missing flat-route behavior.
- [x] Implement minimal flat slug normalization and collision detection.
- [x] Run the focused plugin test and confirm GREEN.

### Task 2: Recursive hierarchy contract

**Files:**

- Modify: `quartz/knowledge-structure.test.ts`
- Modify: `quartz/content-migration.test.ts`
- Modify: `quartz/generated-site.test.ts`

**Interfaces:**

- Consumes: flat basename slug behavior from Task 1.
- Produces: recursive content inventory with level placement, counts, and semantic graph assertions.

- [x] Change test inventory to recurse through numbered folders while excluding support directories.
- [x] Add assertions for one homepage, two level-1 MOCs, seven level-2 MOCs, six level-3 MOCs, and 38 level-4 atomic notes.
- [x] Run the focused hierarchy and migration tests and confirm RED against the partial migration.

### Task 3: Complete the content migration

**Files:**

- Move: all remaining MOCs into their approved level folders.
- Move: every atomic knowledge note into `content/4-level-knowledge/`.
- Modify: `content/index.md` and affected MOC/frontmatter files.

**Interfaces:**

- Consumes: folder/count/graph contract from Task 2.
- Produces: complete four-level hierarchy and connected semantic graph.

- [x] Move `Основы информационной безопасности` and `Linux` into level 1.
- [x] Move the six security directions plus `Лабы и практические руководства` into level 2.
- [x] Move the six thematic MOCs into level 3.
- [x] Move all 38 atomic notes into level 4.
- [x] Update homepage/MOC links and add parents for Linux, Processes, Hardening, and HSTS.
- [x] Run hierarchy and migration tests and confirm GREEN.

### Task 4: End-to-end verification

**Files:**

- Verify: generated output only; no deployment.

**Interfaces:**

- Consumes: Tasks 1-3.
- Produces: evidence that flat routes, links, formatting, types, and tests pass.

- [x] Run plugin tests, hierarchy tests, migration tests, TypeScript/prettier checks, full test suite, and production build.
- [x] Inspect the final diff and request a read-only final review.
- [x] Record any rulings or deferred minor findings without committing.
