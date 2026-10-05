# Quartz 5 Migration Design

## Goal

Migrate `security.maybeso.me` from the customized Quartz 4.5.2 codebase to Quartz 5 while preserving the published professional Second Brain, its important knowledge-navigation features, and a horizontal site header.

The migration must not alter the current Quartz 4 checkout until the Quartz 5 result has been built and reviewed. It must also preserve the user's current uncommitted content curation changes.

## User-facing result

### Navigation

The site keeps a horizontal header at the top of the content area. It is built with Quartz 5's supported `header` layout position rather than by recreating the old Quartz 4 page shell.

The header contains, from left to right:

1. `SECURITY`, linking to `/`.
2. Flexible space.
3. `BLOG`, linking to `https://maybeso.me` in the same tab.
4. Quartz search.
5. Quartz dark-mode control.

The old `Второй мозг`, `Обо мне`, and `Проекты` navigation entries are removed. The header is not fixed to the viewport. On narrow screens it may wrap, but every control must remain usable without horizontal scrolling.

Quartz Explorer is disabled in the initial migration. Search, backlinks, tags, recent notes, and the graph provide content discovery without displacing the top header.

### Page layout

- The root page presents the Second Brain introduction and recent notes directly.
- Article pages retain article title, metadata, source links, backlinks, and table of contents where applicable.
- Graph functionality remains available. The semantic graph and area-specific backlinks are migrated as project-local Quartz 5 plugins without patching Quartz core.
- The visual system starts from Quartz 5 defaults. Only site identity, colors, typography, header layout, and required compatibility styles are carried over. The large home hero and the broad Quartz 4 `custom.scss` redesign are not migrated wholesale.

### Canonical URLs

The public URL scheme is flat:

- Second Brain landing page: `/`
- Article: `/<article>`
- Tag: `/<tag>`

The canonical site does not emit compatibility redirect pages for `/brain`, `/brain/<article>`, or `/tags/<tag>`. The Alias Redirects plugin is disabled, including automatic case redirects, unless redirects are explicitly approved later. Internal links, search results, graph edges, RSS, sitemap, canonical metadata, and tag links must all use the flat form.

Article, tag, and reserved system slugs share one namespace. A collision must fail the build with a diagnostic naming every conflicting source. It must never silently choose one page.

Reserved slugs include at least static assets and generator endpoints required by Quartz, such as `404`, `index.xml`, `sitemap.xml`, and other generated root files discovered during implementation.

## Architecture

### Base

The migration branch starts from the official Quartz 5 commit `97a2d05f80c4c50534959b1d0d41cc4b3895625e` (Quartz `5.0.0`). This keeps the migration auditable and avoids merging the heavily customized Quartz 4 internals into the new architecture.

Quartz 5 configuration lives in `quartz.config.yaml`. Advanced callbacks and project-specific overrides live in `quartz.ts`. Community plugins are pinned by the Quartz plugin lockfile.

### Content import

The current working tree is the source of truth for content, including its modified files and deletions. Import copies only the files that currently exist; deleted notes must not reappear from `main` history.

The Second Brain landing content becomes `content/index.md`. Published article Markdown files are placed at the content root so their normal Quartz canonical slugs are root-level. Existing `about.md` and `projects.md` remain reachable at `/about` and `/projects` but are not linked from the header.

Assets retain stable relative references. The import must verify every local embed and report unresolved assets.

### Slugs

A project-local Quartz 5 transformer preserves the current deterministic Cyrillic-to-ASCII transliteration behavior. It operates before link resolution and exposes focused tests for Latin text, Cyrillic text, punctuation, repeated separators, and nested source paths.

The filesystem structure matches the public article structure: published article Markdown files live at the content root. The transformer is responsible only for deterministic ASCII normalization and does not contain a special `brain/` path rewrite.

### Flat tag pages

Quartz 5 normally generates tag pages under `/tags/<tag>`. A project-local page-type or emitter plugin generates them at `/<tag>` instead and supplies the same canonical slug to every consumer.

Tag links must not be patched independently in multiple components. The flat-tag plugin owns a shared canonical-tag-slug function used by the tag page, tag list, recent notes, search index, graph, sitemap, and RSS integration points available in Quartz 5.

Before emission, a route-manifest validation pass checks article, tag, static, and generated routes for collisions.

### Header

Quartz 5 explicitly supports horizontal components in the `header` layout position. Page title, search, and dark mode use the official community components where their output matches the design.

The `BLOG` external link and any wrapper styling live in a small project-local component plugin. The plugin must not fork Quartz core. Header assembly uses layout priorities and a flex group so upgrades remain localized to configuration and the custom component.

### Migrated custom behavior

Custom Quartz 4 behavior is handled in three categories:

1. **Required for the first accepted v5 build**
   - ASCII transliteration.
   - Flat article and tag routes.
   - Search.
   - Backlinks.
   - Sources on article pages.
   - Table of contents.
   - Recent notes on `/`.

2. **Required knowledge-navigation plugins**
   - Semantic `up`/`down` links.
   - Semantic graph.
   - Area backlink lists.

3. **Do not carry forward automatically**
   - The Quartz 4 `Navigation` component.
   - Home hero.
   - Broad patches to Quartz core components and scripts.
   - Unused exports such as the old blog-page emitter unless a verified current route depends on them.

Category-two features must be implemented as project-local Quartz 5 plugins without patching Quartz core. If that proves impossible, implementation stops at the design boundary and reports the blocker instead of silently dropping the feature.

## Testing and verification

Implementation follows test-first development.

### Automated tests

- ASCII slug transformer unit tests.
- Route-manifest tests for root landing, articles, tags, reserved routes, and collision failures.
- Header render test confirming `SECURITY`, `BLOG`, search, and dark mode while excluding the three removed navigation entries.
- Content import test confirming the curated published note count and excluded categories.
- Link integrity test for emitted internal links and local assets.
- Full Quartz test suite.
- Type checking and formatting checks.
- Production build from a clean dependency/plugin installation.

### Generated-output assertions

The production build must contain:

- `public/index.html` as real Second Brain content, not a meta-refresh redirect.
- Root-level article HTML files.
- Root-level tag HTML files.
- No generated `public/brain/` or `public/tags/` route trees.
- Sitemap, RSS, search index, canonical URLs, and internal links referencing only the flat canonical routes.

### Visual verification

Review desktop, tablet, and mobile layouts locally. Verify:

- Header alignment, wrapping, keyboard focus, and theme switching.
- Search opens and resolves a Russian and an English article.
- Article table of contents and backlinks remain readable.
- Root recent-notes list and tag pages are usable.
- No obvious regressions in light and dark modes.

Local build and browser checks do not count as production deployment verification.

## Delivery boundaries

- Work remains in the isolated `quartz-v5-migration` worktree until review.
- No commit, push, deployment, DNS change, or replacement of the Quartz 4 checkout occurs without separate authorization.
- The existing dirty Quartz 4 working tree is never cleaned, reset, or overwritten.
- The migration handoff reports all intentionally dropped Quartz 4 custom behavior and every unverified production boundary.

## Acceptance criteria

The migration is ready for integration when:

1. The approved top header is present and usable at all supported breakpoints.
2. `/` renders the Second Brain directly.
3. Articles and tags use collision-free flat canonical routes.
4. Search, internal links, backlinks, sources, sitemap, and RSS use those routes.
5. Curated content and local assets are preserved.
6. Required automated checks and a clean production build pass.
7. Visual review shows no blocking desktop or mobile issue.
8. Quartz 4 remains intact and recoverable until the user approves integration.
