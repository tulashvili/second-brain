import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { promisify } from "node:util"
import { ExplicitDraftPublish } from "../plugins/draft-publish/src/index"
import { syncFlatTagPages } from "../scripts/sync-flat-tags"

const execFileAsync = promisify(execFile)
const exists = (file: string): Promise<boolean> =>
  access(file).then(
    () => true,
    () => false,
  )

test("Quartz publishes only notes with boolean draft:false", () => {
  const filter = ExplicitDraftPublish()
  const shouldPublish = (frontmatter: Record<string, unknown>) =>
    filter.shouldPublish({} as never, [{}, { data: { frontmatter } }] as never)

  assert.equal(shouldPublish({ draft: false }), true)
  assert.equal(shouldPublish({ draft: true }), false)
  assert.equal(shouldPublish({}), false)
  assert.equal(shouldPublish({ draft: "false" }), false)
})

test("a Quartz build omits drafts from pages, search, RSS, sitemap, and tags", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "quartz-draft-publish-"))
  const content = path.join(root, "content")
  const output = path.join(root, "public")
  try {
    await mkdir(content)
    await writeFile(path.join(content, "index.md"), "---\ndraft: false\ntitle: Home\n---\n")
    await writeFile(
      path.join(content, "published.md"),
      "---\ndraft: false\ntitle: Public note\ntags: [public-tag]\n---\nPublic body\n",
    )
    await writeFile(
      path.join(content, "hidden-draft.md"),
      "---\ndraft: true\ntitle: Hidden draft marker\ntags: [private-only]\n---\nPrivate body marker\n",
    )
    await writeFile(
      path.join(content, "hidden-missing.md"),
      "---\ntitle: Hidden missing marker\n---\nPrivate body marker\n",
    )
    await writeFile(
      path.join(content, "hidden-string.md"),
      '---\ndraft: "false"\ntitle: Hidden string marker\n---\nPrivate body marker\n',
    )
    assert.deepEqual(await syncFlatTagPages(content, []), ["public-tag"])
    await execFileAsync("npx", ["quartz", "build", "--directory", content, "--output", output], {
      cwd: process.cwd(),
      env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH ?? ""}` },
    })

    assert.equal(await exists(path.join(output, "published.html")), true)
    for (const slug of ["hidden-draft", "hidden-missing", "hidden-string", "private-only"]) {
      assert.equal(await exists(path.join(output, `${slug}.html`)), false, slug)
    }
    const search = await readFile(path.join(output, "static/contentIndex.json"), "utf8")
    const rss = await readFile(path.join(output, "index.xml"), "utf8")
    const sitemap = await readFile(path.join(output, "sitemap.xml"), "utf8")
    for (const outputContent of [search, rss, sitemap]) {
      assert.doesNotMatch(
        outputContent,
        /hidden-draft|hidden-missing|hidden-string|private-only|Private body marker|Hidden draft marker/,
      )
    }
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
