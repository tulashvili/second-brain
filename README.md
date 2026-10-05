# Quartz v5

This repository publishes the second brain at `security.maybeso.me` with Quartz 5 and flat canonical routes.

## Local development

Use Node.js 22 or newer and npm 10.9.2 or newer. Local plugins live under `plugins/`. Run `npm run test:site` after changing plugin source; it installs plugin development dependencies, rebuilds every plugin, and executes all test suites.

- `npm run serve` installs missing plugins, synchronizes tag descriptors, then starts the Quartz development server.
- `npm run build` runs the same preparation through `prebuild`, then writes the production site to `public/`.
- `npm run test:site` runs root integration tests and every local plugin suite.
- `npm run check:site` runs formatting/type checks, tests, and a production build.

Articles, tags, and generated area pages share the root URL namespace. The synchronization step validates the complete route manifest before writing descriptors and fails with every conflicting article, tag, area, or reserved route. It intentionally produces no `/brain/`, `/tags/`, or redirect pages. Wikilinks use the same ASCII route mapping as emitted pages; references to unpublished notes render as non-clickable broken-link text instead of leading to a 404.

These commands verify a local static build only. They do not deploy the site or prove the state of `security.maybeso.me`.

> “[One] who works with the door open gets all kinds of interruptions, but [they] also occasionally gets clues as to what the world is and what might be important.” — Richard Hamming

Quartz is a set of tools that helps you publish your [digital garden](https://jzhao.xyz/posts/networked-thought) and notes as a website for free.

🔗 Read the documentation and get started: https://quartz.jzhao.xyz/

[Join the Discord Community](https://discord.gg/cRFFHYye7t)

## Sponsors

<p align="center">
  <a href="https://github.com/sponsors/jackyzha0">
    <img src="https://cdn.jsdelivr.net/gh/jackyzha0/jackyzha0/sponsorkit/sponsors.svg" />
  </a>
</p>
