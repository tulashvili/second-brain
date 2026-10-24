import assert from "node:assert/strict"
import { access, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { syncFlatTagPages } from "../scripts/sync-flat-tags"

const withContent = async (run: (contentDir: string) => Promise<void>) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "flat-tags-"))
  const contentDir = path.join(root, "content")
  await mkdir(contentDir)
  try {
    await run(contentDir)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

test("syncs deterministic descriptors and deletes stale generated files only", async () => {
  await withContent(async (contentDir) => {
    await writeFile(
      path.join(contentDir, "a.md"),
      "---\ndraft: false\ntitle: A\ntags: [Z Tag, Мониторинг]\n---\n",
    )
    await writeFile(
      path.join(contentDir, "b.md"),
      "---\ndraft: false\ntitle: B\ntags: [alpha]\n---\n",
    )
    await writeFile(path.join(contentDir, "keep.txt"), "keep")
    await mkdir(path.join(contentDir, "_flat-tags"))
    await writeFile(path.join(contentDir, "_flat-tags", "stale.md"), "stale")

    const slugs = await syncFlatTagPages(contentDir, ["404", "index.xml", "sitemap.xml"])
    assert.deepEqual(slugs, ["alpha", "monitoring", "z-tag"])
    await assert.rejects(access(path.join(contentDir, "_flat-tags", "stale.md")))
    assert.equal(await readFile(path.join(contentDir, "keep.txt"), "utf8"), "keep")

    const descriptor = await readFile(path.join(contentDir, "_flat-tags", "monitoring.md"), "utf8")
    assert.match(
      descriptor,
      /^---\ndraft: false\nflatTag: monitoring\ntitle: Мониторинг\ngenerated: true\n---\n$/,
    )
  })
})

test("handles an empty tag set", async () => {
  await withContent(async (contentDir) => {
    await writeFile(
      path.join(contentDir, "index.md"),
      "---\ndraft: false\ntitle: Home\npage: true\n---\n",
    )
    assert.deepEqual(await syncFlatTagPages(contentDir, []), [])
  })
})

test("refuses to write descriptors when validation fails", async () => {
  await withContent(async (contentDir) => {
    await writeFile(
      path.join(contentDir, "monitoring.md"),
      "---\ndraft: false\ntitle: Monitoring\ntags: [monitoring]\n---\n",
    )
    await assert.rejects(syncFlatTagPages(contentDir, []), /monitoring\.md.*tag:monitoring/is)
    await assert.rejects(access(path.join(contentDir, "_flat-tags")))
  })
})

test("ignores tags that occur only in unpublished notes", async () => {
  await withContent(async (contentDir) => {
    await writeFile(
      path.join(contentDir, "published.md"),
      "---\ndraft: false\ntitle: Published\ntags: [public]\n---\n",
    )
    await writeFile(
      path.join(contentDir, "draft.md"),
      "---\ndraft: true\ntitle: Hidden\ntags: [private-only]\n---\n",
    )
    await writeFile(
      path.join(contentDir, "missing.md"),
      "---\ntitle: Hidden too\ntags: [missing-only]\n---\n",
    )
    assert.deepEqual(await syncFlatTagPages(contentDir, []), ["public"])
    await assert.rejects(access(path.join(contentDir, "_flat-tags", "private-only.md")))
    await assert.rejects(access(path.join(contentDir, "_flat-tags", "missing-only.md")))
  })
})
