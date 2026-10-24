import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

test("translation map ignores unpublished notes but requires explicit publication for baseline", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "quartz-translation-policy-"))
  const content = path.join(root, "content")
  const baseline = path.join(root, "baseline.json")
  const output = path.join(root, "pairs.json")
  try {
    for (const locale of ["ru", "en"]) {
      await mkdir(path.join(content, locale), { recursive: true })
      await writeFile(
        path.join(content, locale, "index.md"),
        "---\ntranslationKey: index\ndraft: false\n---\nHome\n",
      )
      await writeFile(
        path.join(content, locale, "unpublished.md"),
        "---\ntranslationKey: unpublished\ndraft: true\n---\nDraft\n",
      )
      await writeFile(
        path.join(content, locale, "private-idea.md"),
        "---\ndraft: true\n---\nUnpaired draft\n",
      )
      await writeFile(path.join(content, locale, "empty-frontmatter.md"), "---\n\n---\nPrivate\n")
      await writeFile(path.join(content, locale, "no-frontmatter.md"), "Private\n")
    }
    await writeFile(
      baseline,
      JSON.stringify({
        pages: [{ source: "content/index.md", slug: "index", url: "https://security.maybeso.me/" }],
      }),
    )
    const args = [
      "tsx",
      "scripts/check-translations.ts",
      "--content",
      content,
      "--baseline",
      baseline,
      "--output",
      output,
    ]
    await execFileAsync("npx", args)
    const pairs = JSON.parse(await readFile(output, "utf8")) as Record<string, unknown>
    assert.deepEqual(Object.keys(pairs), ["index"])

    await writeFile(
      path.join(content, "en", "index.md"),
      "---\ntranslationKey: index\ndraft: true\n---\nHome\n",
    )
    await assert.rejects(execFileAsync("npx", args), /baseline.*not publishable|draft:false/)

    await writeFile(
      path.join(content, "en", "index.md"),
      "---\ntranslationKey: index\ndraft: false\n---\nHome\n",
    )
    await writeFile(
      path.join(content, "ru", "toString.md"),
      "---\ntranslationKey: toString\ndraft: false\n---\nUnpaired\n",
    )
    await assert.rejects(execFileAsync("npx", args), /no baseline translation pair/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
