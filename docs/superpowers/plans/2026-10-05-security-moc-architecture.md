# Security-first MOC Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the flat, counter-style Second Brain entry point with a validated security-first MOC hierarchy while preserving all 33 existing article URLs.

**Architecture:** Keep every Markdown file physically flat in `content/`, classify pages explicitly with `moc: true`, and use `up` wikilinks as the only hierarchy source. Extend the local semantic-navigation plugin to derive reverse children and render semantic navigation, add an article-only RSS emitter, and enforce the content graph in both the Quartz test suite and the Ansible release validator.

**Tech Stack:** Quartz 5, TypeScript, Preact, Vitest/Node test runner, YAML frontmatter, Python `unittest`, Ansible

**Spec:** `docs/superpowers/specs/2026-10-05-security-moc-architecture-design.md`

## Global Constraints

- Preserve all 33 current article filenames, root-level slugs, canonical URLs, and bodies.
- Keep all content physically flat under `content/`; do not add content subdirectories other than the existing generated `_flat-tags/` namespace.
- Treat `moc: true` as the only MOC classifier and `up` as the only hierarchy input. Never generate or persist `down` in Markdown.
- Remove legacy `area` only from ordinary-note frontmatter. MOCs retain the `area` tag from the approved specification.
- Do not re-enable `/brain/`, `/tags/`, alias redirects, or nested public routes.
- MOCs must remain in search and sitemap, but must be excluded from recent articles and RSS.
- Keep rendering finite for malformed graphs, but fail validation for missing parents, invalid targets, self-links, cycles, or unreachable MOCs.
- Follow test-driven development for every behavior change: demonstrate a failing test, implement the smallest change, then rerun the focused test.
- Preserve unrelated changes in both repositories. Do not deploy as part of this implementation plan unless the user separately asks for deployment.

## Review Focus

- Confirm that article classification is defined once and reused by recent notes, RSS, tests, and deployment validation.
- Confirm that every `up` target resolves to a published MOC rather than merely an existing page.
- Confirm that reverse child lists are derived from `up` and do not rely on manually maintained `down`.
- Confirm that all 33 legacy article routes and canonicals remain byte-for-byte equivalent at the URL level.
- Confirm that MOC additions cannot inflate the deployment validator's expected article count.
- Confirm that multiple parents do not duplicate a note within a single generated child list or recurse forever in the root tree.

---

## Task 1: Establish the page-classification and graph-validation model

**Files:**

- Create: `plugins/semantic-navigation/src/model.ts`
- Create: `plugins/semantic-navigation/src/model.test.ts`
- Modify: `plugins/semantic-navigation/src/index.ts`
- Modify: `plugins/semantic-navigation/src/semanticLinks.ts`
- Modify: `plugins/semantic-navigation/src/semanticLinks.test.ts`
- Modify: `plugins/semantic-navigation/src/tree.ts`
- Modify: `plugins/semantic-navigation/src/tree.test.ts`
- Modify: `quartz.ts`

**Interfaces:**

- Export `isMocPage(file)`, `isPublishedArticle(file)`, and `isVisibleContentPage(file)` from `model.ts`.
- Export a pure `buildKnowledgeGraph(files)` result containing parent and child adjacency maps.
- Export `validateKnowledgeGraph(files, rootSlug)` returning structured diagnostics for missing parents, parents that are not MOCs, unparented articles, non-root MOCs without parents, self-links, cycles, and unreachable MOCs.
- Keep `buildSemanticTree(files)` defensive and finite; feed it the derived graph rather than trusting stored `down` metadata.

### Steps

- [ ] Add focused failing tests in `model.test.ts` for ordinary article/MOC/system-page classification, hidden and unlisted pages, duplicate parent elimination, derived reverse children, multiple parents, unresolved parents, non-MOC parents, self-reference, a two-node cycle, and an unreachable MOC.
- [ ] Extend `semanticLinks.test.ts` with a failing case proving that frontmatter `up` is resolved while legacy `down` is not required for reverse children.
- [ ] Extend `tree.test.ts` with a failing case proving that a cyclic input yields a finite tree with a cycle marker.
- [ ] Run `npm --prefix plugins/semantic-navigation test` and record that the new tests fail for the expected missing model behavior.
- [ ] Implement the pure model and validation functions, reuse them from `semanticLinks.ts` and `tree.ts`, and export them from `index.ts`.
- [ ] Replace the local classifier in `quartz.ts` with a direct source import from `./plugins/semantic-navigation/src/model` so `npm run check` works before local plugin packages are built and recent notes exclude MOCs.
- [ ] Run `npm --prefix plugins/semantic-navigation test` and `npx tsc --noEmit` until both pass.
- [ ] Commit in `second-brain`: `feat: define MOC knowledge model`.

## Task 2: Render semantic parent and child navigation

**Files:**

- Create: `plugins/semantic-navigation/src/SemanticParents.tsx`
- Create: `plugins/semantic-navigation/src/MocChildren.tsx`
- Modify: `plugins/semantic-navigation/src/SemanticGraph.tsx`
- Modify: `plugins/semantic-navigation/src/components.tsx`
- Modify: `plugins/semantic-navigation/src/components.test.tsx`
- Modify: `plugins/semantic-navigation/src/AreaBacklinkNotes.tsx`
- Modify: `plugins/semantic-navigation/src/semantic-navigation.scss`
- Modify: `quartz.config.yaml`

**Interfaces:**

- `SemanticParents()` renders the resolved `up` MOCs on ordinary articles and non-root MOCs.
- `MocChildren()` renders a deduplicated, title-sorted `Все заметки раздела` list only on MOCs.
- `SemanticGraph()` renders the full hierarchy only on the root MOC and starts at `index`, not at arbitrary zero-in-degree pages.
- `SemanticNavigation()` composes parents, MOC children, and the root tree.

### Steps

- [ ] Add failing component tests for a single-parent article, a multi-parent article, a MOC with children, a page with no children, duplicate edges, the root-only full tree, and finite cycle rendering.
- [ ] Add a failing configuration assertion that `@quartz-community/breadcrumbs` is disabled and the local semantic navigation component remains enabled.
- [ ] Run `npm --prefix plugins/semantic-navigation test` and `npm test -- --test-name-pattern='semantic|breadcrumb'` to verify the intended failures.
- [ ] Implement `SemanticParents`, `MocChildren`, and the root-based tree using the shared model.
- [ ] Remove the legacy `area`-based discovery path from `AreaBacklinkNotes`; either delete the component or retain it only as a compatibility export that delegates to `MocChildren` without reading `frontmatter.area`.
- [ ] Update styles for the parent row, generated child list, and nested tree while retaining the current font and maybeso.me color tokens.
- [ ] Disable the official breadcrumbs component in `quartz.config.yaml`.
- [ ] Run the focused component tests, plugin build, and TypeScript check until they pass.
- [ ] Commit in `second-brain`: `feat: render semantic MOC navigation`.

## Task 3: Add the approved MOCs and assign every article

**Files:**

- Create: `quartz/knowledge-structure.test.ts`
- Modify: `content/index.md`
- Create: `content/Основы информационной безопасности.md`
- Create: `content/Сетевая безопасность.md`
- Create: `content/Атаки и угрозы.md`
- Create: `content/Обнаружение, логирование и мониторинг.md`
- Create: `content/Безопасность инфраструктуры.md`
- Create: `content/Безопасность приложений и веб-сервисов.md`
- Create: `content/Операционная безопасность и инструменты.md`
- Create: `content/Лаборатории и практические руководства.md`
- Create: `content/Сети и протоколы.md`
- Create: `content/Инфраструктура и платформы.md`
- Create: `content/Хранение данных.md`
- Create: `content/Программирование и автоматизация.md`
- Create: `content/Инструменты и технологии.md`
- Modify: all 33 existing article files listed in the specification

**Content contract:**

- Root `index.md`: `title: Информационная безопасность`, `moc: true`, tags `public` and `area`, no `up`.
- Eight primary MOCs: parent `[[Информационная безопасность]]`.
- Five supporting MOCs: parents exactly as specified in the approved hierarchy.
- All 33 articles: parents exactly as listed in the specification; the eight practical notes receive the approved second parent.
- Every MOC contains a concise Russian introduction and a curated `## Ключевые темы` section. The complete list is generated by the component and is not duplicated manually.

### Steps

- [ ] Write `knowledge-structure.test.ts` first. Parse actual frontmatter and assert exactly 33 ordinary articles, exactly 14 MOCs including `index.md`, the exact approved article-to-parent mapping, the exact MOC-to-parent mapping, no legacy `area` property on ordinary notes, no manually stored `down`, full root reachability, and no cycles.
- [ ] Run `npm test -- --test-name-pattern='knowledge structure'` and verify it fails because the MOCs and assignments do not yet exist.
- [ ] Convert `content/index.md` into the root MOC with the approved eight primary areas, supporting areas, short explanatory copy, and curated key links.
- [ ] Add the thirteen MOC files with approved Russian titles, `moc: true`, tags `[public, area]`, correct `up`, concise introductions, and curated key-topic links.
- [ ] Update only frontmatter in the 33 existing article files: add the exact `up` parents and remove legacy `area`; preserve titles, tags, body text, and filenames.
- [ ] Run the knowledge-structure test and inspect its diagnostic output until every approved relation passes.
- [ ] Run `npm run sync:tags` and inspect `_flat-tags/` changes. Ensure no old area-name descriptor remains solely because of removed `area` properties and that current tags still resolve without route collisions.
- [ ] Commit in `second-brain`: `content: organize notes into security MOCs`.

## Task 4: Add article-only RSS

**Files:**

- Create: `plugins/article-rss/package.json`
- Create: `plugins/article-rss/package-lock.json`
- Create: `plugins/article-rss/tsconfig.json`
- Create: `plugins/article-rss/tsup.config.ts`
- Create: `plugins/article-rss/quartz.plugin.yaml`
- Create: `plugins/article-rss/src/index.ts`
- Create: `plugins/article-rss/src/articleRss.ts`
- Create: `plugins/article-rss/src/articleRss.test.ts`
- Modify: `package.json`
- Modify: `quartz.config.yaml`

**Interfaces:**

- `selectRssArticles(files)` reuses the shared article classifier and sorts with the same date semantics as current Quartz RSS.
- `renderArticleRss(files, options)` generates valid `index.xml` containing ordinary articles only.
- The same emitter writes `static/knowledgeStructure.json` with explicit, sorted `articleSlugs` and `mocSlugs` derived from `moc: true`; this is the release validator's machine-readable classification contract.
- The local emitter owns `index.xml`; upstream content-index keeps search JSON and sitemap generation with its RSS output disabled.

### Steps

- [ ] Scaffold the local plugin package using the same manifest and build conventions as `plugins/semantic-navigation`.
- [ ] Add failing tests for inclusion of visible articles, exclusion of all 14 MOCs, system pages, flat-tag descriptors, hidden/unlisted pages, stable sorting, XML escaping, canonical links, an empty feed, and an exact article/MOC classification manifest.
- [ ] Run `npm --prefix plugins/article-rss test` and verify the expected failures.
- [ ] Implement the pure selector/renderer and Quartz emitter. Declare `@security-maybeso/semantic-navigation: file:../semantic-navigation` as a package dependency and import its built classifier so the feed and UI use the same page model.
- [ ] Set upstream content-index `enableRSS: false`, enable `./plugins/article-rss`, and add the new package to `plugins:deps`, `plugins:build`, and `test:site`.
- [ ] Build the plugin and run its tests plus `npx tsc --noEmit`.
- [ ] Commit in `second-brain`: `feat: emit article-only RSS`.

## Task 5: Strengthen the generated-site contract

**Files:**

- Modify: `quartz/generated-site.test.ts`
- Modify: `quartz.config.yaml`
- Modify: `quartz.ts`

### Steps

- [ ] Update the generated-site test first so it independently parses frontmatter and expects 33 article routes plus 14 MOC routes rather than treating every non-system Markdown file as an article.
- [ ] Add failing assertions for all legacy article canonicals, all flat MOC canonicals, articles and MOCs in `static/contentIndex.json` and `sitemap.xml`, articles only in `index.xml`, MOCs absent from the recent-article block, semantic parent links on `proxy`, both parents on a practical article, generated child links on a representative MOC, and no `/brain/`, `/tags/`, or meta-refresh output.
- [ ] Run `npm test -- --test-name-pattern='production site'` and confirm the expected integration failures before adjusting configuration or page composition.
- [ ] Make the smallest required adjustments to the layout and plugin ordering so the new navigation is available when components render and the root recent-article block still appears after the editorial MOC content.
- [ ] Run the focused generated-site test until it passes, then run all root tests.
- [ ] Commit in `second-brain`: `test: enforce MOC publishing contract`.

## Task 6: Update the declarative deployment validator

**Files in `/Users/omartulashvili/Documents/my_ansible`:**

- Modify: `playbook/second_brain/files/validate_quartz_build.py`
- Modify: `playbook/second_brain/tests/test_deployment.py`
- Modify: `inventory/group_vars/second_brain/vars.yml`
- Modify: `playbook/second_brain/deploy.yml` only if the validator CLI requires a separate expected MOC count argument

**Interface:**

- The validator reads `static/knowledgeStructure.json`, cross-checks it against `static/contentIndex.json`, and reports distinct `article_count`, `moc_count`, `tag_count`, and their sorted slugs.
- Deployment variables explicitly retain `second_brain_expected_note_count: 33` for articles and add `second_brain_expected_moc_count: 14`.
- The validator never infers MOCs from titles, tags, filenames, or RSS membership; `moc: true` classification is carried through the generated manifest.

### Steps

- [ ] Extend `test_deployment.py` first with a fixture containing two articles, one MOC, one tag descriptor, and a matching `static/knowledgeStructure.json`; assert separate counts and root-level files.
- [ ] Add failing validator tests for a missing MOC page, an unexpected MOC count, a nested slug, missing `index.xml`, an RSS feed containing a MOC URL, and the existing forbidden `brain`/`tags` directories.
- [ ] Run `python3 -m unittest playbook.second_brain.tests.test_deployment.SecondBrainDeploymentContractTests` and confirm the new failures.
- [ ] Update the validator and public variables without changing any secret-bearing inventory.
- [ ] Ensure the deploy playbook passes both expected counts to every local and staged validation call and preserves atomic release/rollback behavior.
- [ ] Run the focused deployment tests and then the complete `playbook/second_brain/tests` suite.
- [ ] Commit in `my_ansible`: `test: validate second brain MOC releases`.

## Task 7: Run full repository checks and review the implementation

**Files:**

- Review only: all changed files in `/Users/omartulashvili/Documents/second-brain`
- Review only: all changed files in `/Users/omartulashvili/Documents/my_ansible`

### Steps

- [ ] In `second-brain`, inspect `git diff --check`, `git diff --stat`, and the full diff for unintended body, filename, typography, palette, or route changes.
- [ ] Run `npm run check:site`; do not claim success unless formatting, type-checking, all plugin tests, all root tests, and the production build pass.
- [ ] Run the Ansible build validator against the generated `public/` with expected counts 33 and 14, then run the relevant Python deployment tests.
- [ ] Request a read-only `reviewer` subagent, as required by `AGENTS.md`, to review graph correctness, multi-parent behavior, route/RSS classification, test coverage, and deployment-validator compatibility.
- [ ] Address every material reviewer finding with a focused regression test and rerun the affected checks.
- [ ] Verify both repositories are clean except for intentional commits and record the final commit hashes.

## Task 8: Perform local browser verification

**Files:**

- No source changes unless browser inspection finds a reproducible defect; any fix must begin with a regression test in the owning task above.

### Steps

- [ ] Start the local Quartz server with the repository's normal `npm run serve` workflow and wait for a successful build.
- [ ] Inspect `/` at desktop and mobile widths: Russian root title, eight primary areas, supporting areas, article-only updates, and the full semantic tree.
- [ ] Inspect `/setevaya-bezopasnost`: editorial introduction, curated key topics, generated child notes, root parent link, graph, and backlinks.
- [ ] Inspect `/proxy`: parent navigation to `Сетевая безопасность`, unchanged flat URL and canonical, and no filesystem breadcrumb.
- [ ] Inspect one practical note such as the Nginx forward-proxy guide: both domain and laboratory parents render once.
- [ ] Inspect `/index.xml`, `sitemap.xml`, and search: RSS contains articles only; search and sitemap contain both articles and all 14 MOCs.
- [ ] Check the browser console and network log for broken assets, unresolved internal links, redirects, hydration errors, or duplicate-slash URLs.
- [ ] Stop the local server and summarize local verification separately from any future production deployment verification.

## Completion Criteria

- Exactly 33 ordinary articles and 14 MOCs pass the content graph contract.
- Every article has its approved parent or parents; every non-root MOC is reachable from `index`.
- No ordinary note retains `area`, and no page stores `down` manually.
- Parent navigation, generated child lists, and the root semantic tree render from `up` relationships.
- Search and sitemap include articles and MOCs; recent updates and RSS include articles only.
- All legacy article URLs and canonical links remain unchanged and flat.
- `npm run check:site`, the Ansible validator, the relevant deployment tests, reviewer inspection, and local browser verification all pass.
