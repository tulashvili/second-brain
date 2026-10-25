# Published Note Formatting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give the 15 selected published Russian articles a readable AAA-inspired structure, keep the English pairs aligned, and document a restrained writing style.

**Architecture:** Edit article bodies only. Preserve every existing sentence, code block, image, and link; add short headings, callouts, and a concise conclusion only where it adds a distinct takeaway. Keep all MOC/navigation pages untouched.

**Tech Stack:** Markdown, Quartz 5, bilingual `content/ru` and `content/en`.

**Spec:** User approval of the 15 articles recommended in the previous response, with unchanged wording, minimal additions, untouched navigation notes, and `WRITING-STYLE.md` referenced by `AGENTS.md`.

## Global Constraints

- The 15 articles are CDN, HSTS, Hardening, LAN, PAN, OSI, OOM, Proxmox, Proxy, SSL Upstream Injection, Slow Attack, Computer Networks, Linux Processes, Deploying Elastic Stack, and OSI Physical Layer.
- Preserve existing Russian and English body lines; add only structure and concise summaries grounded in each note.
- Do not change frontmatter, routes, links, images, commands, or navigation notes.
- Update each corresponding English article in the same stage.

## Review Focus

- Existing body content survives formatting, including code fences, PlantUML, images, and wikilinks.
- Russian and English pairs retain matching `translationKey` values and usable structure.
- Callout Markdown renders as intended in Quartz.
- Generated pages and links pass `npm run check:site`.
- Only the 30 articles, `WRITING-STYLE.md`, `AGENTS.md`, and this plan are staged.

## Tasks

### Task 1: Establish writing rules and guardrails

- [x] Create `WRITING-STYLE.md` with article structure, preserved wording, use of examples and admonitions, concise endings, and bilingual update rules.
- [x] Add a reference to `WRITING-STYLE.md` in root `AGENTS.md`.
- [x] Capture the 30 original article bodies to compare after edits.

### Task 2: Format conceptual articles and English pairs

- [x] Update the 15 Russian articles with content-specific headings, existing examples in callouts where natural, and concise conclusions.
- [x] Mirror the same structure in the 15 English pairs without rewriting existing prose.
- [x] Verify pre-existing lines remain in order and all expected paths changed.

### Task 3: Verify and review

- [x] Inspect the full diff and check for unintended changes or secret material.
- [x] Run `npm run check:site` and relevant formatting checks.
- [x] Request a read-only reviewer subagent for the final diff and address important findings.
- [x] Stage task-owned paths, commit in the repository's message convention, and push the current branch to its owned upstream.
