# Quartz 5 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reviewed Quartz 5 version of `security.maybeso.me` with the approved horizontal header, curated content, flat article and tag URLs, and preserved knowledge-navigation features.

**Architecture:** Start from the isolated official Quartz 5 worktree, import the live Quartz 4 content snapshot, and express every site-specific behavior as a small local Quartz 5 plugin. Root-level generated tag descriptor pages make tag routes visible to standard search, sitemap, and RSS processing, while a shared route manifest rejects namespace collisions before build output is written.

**Tech Stack:** Quartz 5.0.0, TypeScript 5.9, Preact, unified/vfile, YAML configuration, tsup, Node test runner, Vitest, Sass.

**Spec:** `docs/superpowers/specs/2026-10-02-quartz-v5-migration-design.md`

## Global Constraints

- Work only in `/Users/omartulashvili/Documents/second-brain-quartz-v5` on branch `quartz-v5-migration`.
- Treat `/Users/omartulashvili/Documents/second-brain/content` as read-only migration input; never reset, clean, or overwrite the Quartz 4 checkout.
- Use official Quartz 5 commit `97a2d05f80c4c50534959b1d0d41cc4b3895625e` and Node.js 22 or newer.
- Do not patch Quartz core for project features; use local plugins under `plugins/` and configuration in `quartz.config.yaml` or `quartz.ts`.
- Match local plugin build/test dependency versions to the official Quartz 5 community packages already pinned by `package-lock.json`; add no unrelated runtime dependencies.
- Disable Alias Redirects and emit no `/brain`, `/brain/<article>`, or `/tags/<tag>` compatibility pages.
- Canonical routes are `/`, `/<article>`, and `/<tag>`; all route collisions are fatal.
- Preserve the current 33-note professional content set, including current working-tree modifications and deletions.
- Do not commit, push, deploy, change DNS, or replace the Quartz 4 checkout without explicit authorization. Commit steps below are approval checkpoints only.

## Review Focus

- Two Cyrillic or case-variant names normalizing to the same ASCII slug must fail with both source names in the diagnostic; Task 2 and Task 3 add this coverage.
- A tag matching an article, system route, or another normalized tag must fail before tag descriptors or HTML are written; Task 3 tests all three classes.
- Missing local images and embeds after moving notes from `content/brain/` to `content/` must fail link-integrity tests with the referring note; Task 1 owns this test.
- Cyclic semantic `up`/`down` relationships must render a finite tree with a cycle marker instead of recursing indefinitely; Task 6 owns this test.
- The top header must remain keyboard-usable and non-scrolling at desktop, tablet, and mobile widths; Task 4 adds DOM assertions and Task 8 performs visual verification.

---

### Task 1: Import and verify the curated content snapshot

**Files:**

- Create: `quartz/content-migration.test.ts`
- Replace: `content/**` with the current files from `/Users/omartulashvili/Documents/second-brain/content/**`
- Move: `content/brain.md` to `content/index.md`
- Move: existing `content/brain/*.md` to `content/*.md`
- Preserve: `content/assets/**`, `content/about.md`, `content/projects.md`

**Interfaces:**

- Consumes: the current Quartz 4 working-tree content, including deletions.
- Produces: 33 root-level article Markdown files plus `index.md`, `about.md`, `projects.md`, and assets; article identification predicate `isArticleFrontmatter(data: Record<string, unknown>): boolean` in the test utility.

- [ ] **Step 1: Write the failing content inventory tests**

Add Node tests named `imports exactly the curated 33 articles`, `keeps excluded categories out`, `has no published brain subdirectory`, and `resolves every local markdown embed`. Assert that page documents and generated tag descriptors are excluded from the article count.

- [ ] **Step 2: Run the tests and verify RED**

Run: `PATH=/opt/homebrew/bin:$PATH npx tsx --test quartz/content-migration.test.ts`

Expected: FAIL because the official Quartz 5 documentation content is still present and the curated article inventory is absent.

- [ ] **Step 3: Import the live content snapshot**

Validate both absolute paths, then replace only the isolated worktree's `content/` contents from the live Quartz 4 `content/` directory. Promote `brain.md` to `index.md`, move the 33 existing article files from `content/brain/` to the root, and leave the source checkout unchanged.

- [ ] **Step 4: Repair only migration-induced asset references**

Update relative local asset paths that became invalid because an article moved up one directory. Do not rewrite working wikilinks or editorial text.

- [ ] **Step 5: Run the content tests and verify GREEN**

Run: `PATH=/opt/homebrew/bin:$PATH npx tsx --test quartz/content-migration.test.ts`

Expected: four passing tests, 33 articles, zero unresolved local embeds.

- [ ] **Step 6: Commit checkpoint (requires explicit authorization)**

Suggested commit: `content: import curated second brain into quartz 5`

### Task 2: Add deterministic ASCII slug normalization

**Files:**

- Create: `plugins/ascii-slug/package.json`
- Create: `plugins/ascii-slug/tsconfig.json`
- Create: `plugins/ascii-slug/tsup.config.ts`
- Create: `plugins/ascii-slug/src/slug.ts`
- Create: `plugins/ascii-slug/src/index.ts`
- Test: `plugins/ascii-slug/src/slug.test.ts`
- Create: `quartz.config.yaml`

**Interfaces:**

- Consumes: `file.data.slug` after Quartz frontmatter/path initialization.
- Produces: `transliterateSegment(input: string): string`, `toAsciiSlug(slug: string): string`, and `AsciiSlug(): QuartzTransformerPluginInstance`.

- [ ] **Step 1: Scaffold the local plugin package without implementation**

Use package name `@security-maybeso/ascii-slug`, Quartz plugin name `ascii-slug`, Node `>=22`, and dependencies on `@quartz-community/types`. Expose the plugin from `dist/index.js` and types from `dist/index.d.ts`.

- [ ] **Step 2: Write failing slug unit tests**

Cover Latin lowercase normalization, `Физический уровень модели OSI` → `fizicheskiy-uroven-modeli-osi`, punctuation, ampersands, repeated separators, nested paths, an empty normalized segment, and equivalent Cyrillic/case inputs producing the same canonical slug.

- [ ] **Step 3: Run the plugin tests and verify RED**

Run: `PATH=/opt/homebrew/bin:$PATH npm --prefix plugins/ascii-slug test`

Expected: FAIL because `transliterateSegment` and `toAsciiSlug` are not implemented.

- [ ] **Step 4: Implement the minimal transformer**

Implement the exact exported signatures from the Interfaces block. Preserve the v4 Cyrillic character map and normalize each path segment independently. The transformer updates `file.data.slug` only when the normalized value is non-empty.

- [ ] **Step 5: Register and build the plugin**

Copy the official default YAML into project configuration, add local source `./plugins/ascii-slug` at order 15 (after Created Modified Date and before syntax/Markdown/link processing), install it with the Quartz plugin CLI, and build its `dist/` output.

- [ ] **Step 6: Verify GREEN**

Run: `PATH=/opt/homebrew/bin:$PATH npm --prefix plugins/ascii-slug test && npm --prefix plugins/ascii-slug run build`

Expected: all slug tests pass and the package builds without warnings.

- [ ] **Step 7: Commit checkpoint (requires explicit authorization)**

Suggested commit: `feat: add quartz 5 ascii slug plugin`

### Task 3: Create a collision-safe flat tag page system

**Files:**

- Create: `plugins/flat-tag-page/package.json`
- Create: `plugins/flat-tag-page/tsconfig.json`
- Create: `plugins/flat-tag-page/tsup.config.ts`
- Create: `plugins/flat-tag-page/src/routes.ts`
- Create: `plugins/flat-tag-page/src/FlatTagContent.tsx`
- Create: `plugins/flat-tag-page/src/FlatTagList.tsx`
- Create: `plugins/flat-tag-page/src/index.ts`
- Test: `plugins/flat-tag-page/src/routes.test.ts`
- Test: `plugins/flat-tag-page/src/components.test.tsx`
- Create: `scripts/sync-flat-tags.ts`
- Test: `quartz/flat-tag-sync.test.ts`
- Modify: `package.json`
- Modify: `.gitignore`
- Modify: `quartz.config.yaml`

**Interfaces:**

- Consumes: article slugs and normalized frontmatter tags after Task 2.
- Produces: `canonicalTagSlug(tag: string): FullSlug`, `RouteClaim`, `collectRouteClaims(files, tags, reserved): RouteClaim[]`, `validateRouteClaims(claims): void`, `FlatTagRoutes(): QuartzTransformerPluginInstance`, `FlatTagPage()`, and `FlatTagList()`.
- Produces generated source pages at `content/.flat-tags/<tag>.md` whose transformed canonical slug is `/<tag>` and whose frontmatter contains `flatTag: <tag>`.

- [ ] **Step 1: Write failing route-manifest tests**

Test distinct article/tag routes, article-versus-tag collision, case/transliteration collision, collision with `404`, `index.xml`, and `sitemap.xml`, duplicate normalized tags, and a diagnostic that includes every conflicting source.

- [ ] **Step 2: Run route tests and verify RED**

Run: `PATH=/opt/homebrew/bin:$PATH npm --prefix plugins/flat-tag-page test -- routes.test.ts`

Expected: FAIL because the route helpers do not exist.

- [ ] **Step 3: Implement route helpers**

Use the exact Interfaces signatures. Normalize claims before grouping; throw one aggregated error before any generated tag file or HTML is written.

- [ ] **Step 4: Write failing descriptor-sync tests**

Test deterministic tag ordering, stale descriptor deletion inside only `content/.flat-tags/`, empty tag sets, descriptor frontmatter, and refusal to write when route validation fails.

- [ ] **Step 5: Implement `scripts/sync-flat-tags.ts`**

Export `syncFlatTagPages(contentDir: string, reserved: readonly string[]): Promise<string[]>`. The CLI wrapper accepts `--content <absolute-or-relative-path>`, validates that the target ends in `content`, and writes only under `.flat-tags`.

- [ ] **Step 6: Write failing component/page-type tests**

Assert that `FlatTagList` links `#monitoring` to `/monitoring`, `FlatTagContent` lists only matching non-hidden articles, and `FlatTagPage` claims only files with string frontmatter `flatTag`.

- [ ] **Step 7: Implement the page type and component**

Base rendering behavior on the official Quartz 5 Tag Page package, but use the descriptor page's already-flat slug and the shared `canonicalTagSlug`. `FlatTagRoutes` runs at order 16 and rewrites only `.flat-tags/<tag>` descriptor slugs to `<tag>` before link resolution. Do not fork or edit the installed community package.

- [ ] **Step 8: Wire generation and configuration**

Add `sync:tags` and project-level `build`/`serve` scripts that run tag sync before Quartz. Disable the official Tag Page and Tag List plugins, register `./plugins/flat-tag-page`, and configure the official Graph plugin with `showTags: false` so it never generates `/tags/` links.

- [ ] **Step 9: Verify GREEN**

Run: `PATH=/opt/homebrew/bin:$PATH npm --prefix plugins/flat-tag-page test && npx tsx --test quartz/flat-tag-sync.test.ts && npm run sync:tags`

Expected: all route, generator, page-type, and component tests pass; exactly the current normalized tag descriptors are generated.

- [ ] **Step 10: Commit checkpoint (requires explicit authorization)**

Suggested commit: `feat: publish tags at flat canonical routes`

### Task 4: Configure the approved Quartz 5 header and theme

**Files:**

- Create: `plugins/blog-link/package.json`
- Create: `plugins/blog-link/tsconfig.json`
- Create: `plugins/blog-link/tsup.config.ts`
- Create: `plugins/blog-link/src/BlogLink.tsx`
- Create: `plugins/blog-link/src/blog-link.scss`
- Create: `plugins/blog-link/src/index.ts`
- Test: `plugins/blog-link/src/BlogLink.test.tsx`
- Test: `quartz/site-config.test.ts`
- Modify: `quartz.config.yaml`
- Modify: `quartz/styles/custom.scss`

**Interfaces:**

- Consumes: Quartz layout component props and the configured base URL.
- Produces: `BlogLink(): QuartzComponentConstructor` rendering `BLOG` → `https://maybeso.me` in the same tab.

- [ ] **Step 1: Write failing header and configuration tests**

Assert the `BLOG` label and URL, absence of `target="_blank"`, Page Title/Search/Darkmode positions in `header`, Page Title text `SECURITY`, disabled Explorer/Reader Mode/Alias Redirects, locale `ru-RU`, and base URL `security.maybeso.me`.

- [ ] **Step 2: Run tests and verify RED**

Run: `PATH=/opt/homebrew/bin:$PATH npm --prefix plugins/blog-link test && npx tsx --test quartz/site-config.test.ts`

Expected: FAIL because the component and site configuration are not present.

- [ ] **Step 3: Implement `BlogLink` and responsive styles**

Render one external anchor with accessible text. Style only the header flex behavior, focus states, spacing, and mobile wrapping; do not recreate the Quartz 4 card or fixed positioning.

- [ ] **Step 4: Configure official header components**

Set Page Title priority 10, Blog Link priority 20, Search priority 30, and Darkmode priority 40 in the `header` position. Group the actions so the title remains left-aligned and controls remain usable without horizontal scrolling.

- [ ] **Step 5: Apply the approved site identity**

Set the Quartz 5 configuration to `SECURITY`, `security.maybeso.me`, `ru-RU`, and the existing approved light/dark color tokens. Keep Quartz 5 default structural styles outside the focused header overrides.

- [ ] **Step 6: Verify GREEN**

Run: `PATH=/opt/homebrew/bin:$PATH npm --prefix plugins/blog-link test && npx tsx --test quartz/site-config.test.ts && npm --prefix plugins/blog-link run build`

Expected: all header/configuration tests pass and the plugin builds.

- [ ] **Step 7: Commit checkpoint (requires explicit authorization)**

Suggested commit: `feat: add horizontal security site header`

### Task 5: Port article Sources as a local component plugin

**Files:**

- Create: `plugins/sources/package.json`
- Create: `plugins/sources/tsconfig.json`
- Create: `plugins/sources/tsup.config.ts`
- Create: `plugins/sources/src/parseSource.ts`
- Create: `plugins/sources/src/Sources.tsx`
- Create: `plugins/sources/src/sources.scss`
- Create: `plugins/sources/src/index.ts`
- Test: `plugins/sources/src/Sources.test.tsx`
- Modify: `quartz.config.yaml`

**Interfaces:**

- Consumes: frontmatter `source: string | string[]`, current page slug, and flat article slugs.
- Produces: `parseSource(value: string, from: FullSlug): ParsedSource` and `Sources(): QuartzComponentConstructor`.

- [ ] **Step 1: Write failing source parsing/render tests**

Cover one external URL, multiple sources, a wikilink with alias, a root-level internal target, a plain non-URL string, empty entries, and external link security attributes.

- [ ] **Step 2: Run tests and verify RED**

Run: `PATH=/opt/homebrew/bin:$PATH npm --prefix plugins/sources test`

Expected: FAIL because the parser and component are not implemented.

- [ ] **Step 3: Implement the parser and component**

Use Quartz 5 path utilities and Task 2's canonical slug behavior. Render nothing when `source` is absent or normalizes to an empty list.

- [ ] **Step 4: Register the component after article bodies**

Place Sources in `afterBody` for content pages. Its own component guard must suppress it on `/`, tag descriptors, About, and Projects.

- [ ] **Step 5: Verify GREEN**

Run: `PATH=/opt/homebrew/bin:$PATH npm --prefix plugins/sources test && npm --prefix plugins/sources run build`

Expected: all source cases pass and the package builds.

- [ ] **Step 6: Commit checkpoint (requires explicit authorization)**

Suggested commit: `feat: port article sources component to quartz 5`

### Task 6: Port semantic links, semantic graph, and area backlinks

**Files:**

- Create: `plugins/semantic-navigation/package.json`
- Create: `plugins/semantic-navigation/tsconfig.json`
- Create: `plugins/semantic-navigation/tsup.config.ts`
- Create: `plugins/semantic-navigation/src/semanticLinks.ts`
- Create: `plugins/semantic-navigation/src/tree.ts`
- Create: `plugins/semantic-navigation/src/SemanticGraph.tsx`
- Create: `plugins/semantic-navigation/src/AreaBacklinkNotes.tsx`
- Create: `plugins/semantic-navigation/src/semantic-navigation.scss`
- Create: `plugins/semantic-navigation/src/index.ts`
- Test: `plugins/semantic-navigation/src/semanticLinks.test.ts`
- Test: `plugins/semantic-navigation/src/tree.test.ts`
- Test: `plugins/semantic-navigation/src/components.test.tsx`
- Modify: `quartz.config.yaml`

**Interfaces:**

- Consumes: frontmatter/inline `up` and `down` wikilinks, flat content slugs, article links, `area`, and `area` tags.
- Produces: `extractSemanticTargets(input: unknown): string[]`, `SemanticLinks(): QuartzTransformerPluginInstance`, `buildSemanticTree(files): SemanticTree`, `SemanticGraph()`, and `AreaBacklinkNotes()`.

- [ ] **Step 1: Write failing semantic extraction tests**

Cover frontmatter strings/arrays, inline `up ::` and `down ::`, aliases, duplicate links, missing targets, flat slug resolution, and link insertion into `file.data.links`.

- [ ] **Step 2: Implement the semantic transformer and verify GREEN**

Run RED first with `PATH=/opt/homebrew/bin:$PATH npm --prefix plugins/semantic-navigation test -- semanticLinks.test.ts`, implement the exact Interfaces signatures, then rerun and expect PASS.

- [ ] **Step 3: Write failing tree tests**

Cover one root with children, `up` reversing the edge direction, disconnected trees, deterministic ordering, and an `A → B → A` cycle that returns a finite representation with a cycle marker.

- [ ] **Step 4: Implement `buildSemanticTree` and verify GREEN**

Run only `tree.test.ts` RED, implement an adjacency-map traversal with a per-path visited set, then rerun and expect PASS.

- [ ] **Step 5: Write failing component tests**

Assert that Semantic Graph renders only on `/`, Area Backlink Notes renders only for an `area` note, hidden notes are excluded, frontmatter `area` and normal backlinks both qualify, and all hrefs use flat routes.

- [ ] **Step 6: Implement and register the components**

Place both components in `afterBody`; each component owns its page guard. Register the transformer at order 55, before Crawl Links at order 60, so semantic edges join the standard backlink graph.

- [ ] **Step 7: Run the complete plugin suite**

Run: `PATH=/opt/homebrew/bin:$PATH npm --prefix plugins/semantic-navigation test && npm --prefix plugins/semantic-navigation run build`

Expected: all extraction, tree, cycle, and rendering tests pass.

- [ ] **Step 8: Commit checkpoint (requires explicit authorization)**

Suggested commit: `feat: port semantic navigation to quartz 5`

### Task 7: Integrate recent notes, routes, search, sitemap, and RSS

**Files:**

- Modify: `quartz.ts`
- Modify: `quartz.config.yaml`
- Modify: `package.json`
- Create: `quartz/generated-site.test.ts`
- Modify: `README.md`

**Interfaces:**

- Consumes: Tasks 1–6 plugin exports and generated tag descriptors.
- Produces: `isPublishedArticle(file: QuartzPluginData): boolean` in `quartz.ts`; project scripts `build`, `serve`, `check:site`, and `test:site`.

- [ ] **Step 1: Write the failing generated-site integration test**

Build into a temporary output directory and assert real content at `index.html`, 33 root-level article pages, all root-level tag pages, no `brain/` or `tags/` directories, no meta-refresh pages, flat internal links, canonical URLs, search index entries, sitemap entries, and RSS article URLs.

- [ ] **Step 2: Run the integration test and verify RED**

Run: `PATH=/opt/homebrew/bin:$PATH npx tsx --test quartz/generated-site.test.ts`

Expected: FAIL until configuration and all local plugins are integrated.

- [ ] **Step 3: Configure recent notes and content layout**

In `quartz.ts`, configure Recent Notes with title `Обновления заметок`, limit 10, `showTags: false`, and `isPublishedArticle`. Keep official Backlinks and Table of Contents, configure Sources and Area Backlinks after article bodies, and render Semantic Graph after the root body.

- [ ] **Step 4: Configure content outputs**

Enable Content Index with sitemap and RSS, Search with preview, Content Page, Graph with tag nodes disabled, Favicon, OG image, Assets, Static, and 404. Disable Folder Page, Alias Redirects, and Explorer because all published pages occupy the root namespace.

- [ ] **Step 5: Add reproducible project scripts**

Make every supported build/serve entrypoint run local plugin installation and tag synchronization first. `test:site` runs root tests plus each local plugin suite; `check:site` runs formatting, type checking, tests, and the production build.

- [ ] **Step 6: Verify GREEN**

Run: `PATH=/opt/homebrew/bin:$PATH npm run test:site && npm run build`

Expected: all plugin/root/integration tests pass; production output contains only flat canonical routes.

- [ ] **Step 7: Document local development and migration behavior**

Document Node requirements, plugin installation, `npm run serve`, `npm run build`, flat-route collision failures, and the fact that local verification is not deployment verification.

- [ ] **Step 8: Commit checkpoint (requires explicit authorization)**

Suggested commit: `feat: integrate quartz 5 second brain site`

### Task 8: Final verification and visual review

**Files:**

- No planned production files; review fixes are limited to the files explicitly owned by Tasks 2–7
- Review: `docs/superpowers/specs/2026-10-02-quartz-v5-migration-design.md`

**Interfaces:**

- Consumes: complete Quartz 5 migration.
- Produces: verified local preview and a migration-gap report with no unreported failures.

- [ ] **Step 1: Run clean-install verification**

Remove only generated dependencies and build output inside the isolated worktree, then run `PATH=/opt/homebrew/bin:$PATH npm ci`, `npx quartz plugin install --from-config`, and `npm run check:site`.

Expected: dependency audit has no known vulnerabilities; formatting, type checks, all tests, and production build pass.

- [ ] **Step 2: Inspect the final diff**

Run `git status --short`, `git diff --check`, and `git diff --stat`. Confirm no generated `.quartz/plugins`, `node_modules`, build output, secrets, or unrelated Quartz core edits are staged or tracked.

- [ ] **Step 3: Verify desktop, tablet, and mobile layouts**

Start `npm run serve` and inspect `/`, one Russian article, one English article, and one tag at desktop, tablet, and mobile widths in both themes. Confirm keyboard access to `SECURITY`, `BLOG`, search, and dark mode, with no horizontal scrolling.

- [ ] **Step 4: Verify interactive knowledge navigation**

Search for one Russian and one English article, open a backlink, verify Sources, inspect an area note, and confirm the root Semantic Graph terminates cycles visibly.

- [ ] **Step 5: Request read-only reviewer subagent**

Ask a `reviewer` to inspect the entire worktree against the approved spec, with emphasis on canonical routes, content preservation, plugin isolation, security attributes, and test coverage. Resolve every actionable finding and rerun the affected checks.

- [ ] **Step 6: Run final evidence commands**

Run: `PATH=/opt/homebrew/bin:$PATH npm run check:site`

Expected: zero formatting, type-check, test, or build failures after review fixes.

- [ ] **Step 7: Commit checkpoint (requires explicit authorization)**

Suggested commit: `chore: finalize quartz 5 migration`

- [ ] **Step 8: Report boundaries**

Report the exact worktree path, checks run, routes verified, reviewer result, any deliberately dropped v4 behavior, and that deployment/DNS/runtime production state remains unverified.
