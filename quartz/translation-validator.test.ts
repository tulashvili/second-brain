import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"

const note = (key: string): string =>
  `---\ntranslationKey: ${key}\ntitle: Example\n---\n\nExample text.\n`

const fixture = (english: Record<string, string>) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "quartz-translations-"))
  const content = path.join(root, "content")
  mkdirSync(path.join(content, "ru"), { recursive: true })
  mkdirSync(path.join(content, "en"), { recursive: true })
  writeFileSync(path.join(content, "ru", "Russian.md"), note("russian"))
  for (const [file, key] of Object.entries(english)) {
    writeFileSync(path.join(content, "en", file), note(key))
  }
  const baseline = path.join(root, "baseline.json")
  writeFileSync(
    baseline,
    JSON.stringify({
      pages: [
        {
          source: "content/Russian.md",
          slug: "russian",
          url: "https://security.maybeso.me/russian",
          kind: "article",
        },
      ],
    }),
  )
  const output = path.join(root, "localization", "routes.json")
  const run = () =>
    spawnSync(
      "npx",
      [
        "tsx",
        "scripts/check-translations.ts",
        "--content",
        content,
        "--baseline",
        baseline,
        "--output",
        output,
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH ?? ""}` },
      },
    )
  return { root, output, run }
}

test("translation validator writes paired Russian and English URLs", () => {
  const { root, output, run } = fixture({ "english.md": "russian" })
  try {
    const result = run()
    assert.equal(result.status, 0, result.stderr)
    const pairs = JSON.parse(readFileSync(output, "utf8"))
    assert.deepEqual(pairs.russian, {
      ruPath: "content/ru/Russian.md",
      enPath: "content/en/english.md",
      ruUrl: "https://security.maybeso.me/russian",
      enUrl: "https://security.maybeso.me/en/english",
    })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("translation validator rejects duplicate keys", () => {
  const { root, run } = fixture({ "one.md": "russian", "two.md": "russian" })
  try {
    const result = run()
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /duplicate translationKey/i)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("translation validator rejects missing counterparts", () => {
  const { root, run } = fixture({})
  try {
    const result = run()
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /missing English counterpart/i)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
