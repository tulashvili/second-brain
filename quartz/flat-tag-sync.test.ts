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
      '---\ntitle: A\nversion: "0.1"\ntags: [Z Tag, Мониторинг]\n---\n',
    )
    await writeFile(
      path.join(contentDir, "b.md"),
      '---\ntitle: B\nversion: "0.1"\ntags: [alpha]\n---\n',
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
      /^---\nflatTag: monitoring\ntitle: Мониторинг\ngenerated: true\n---\n$/,
    )
  })
})

test("handles an empty tag set", async () => {
  await withContent(async (contentDir) => {
    await writeFile(path.join(contentDir, "index.md"), "---\ntitle: Home\npage: true\n---\n")
    assert.deepEqual(await syncFlatTagPages(contentDir, []), [])
  })
})

test("does not generate public tag pages from draft-only notes", async () => {
  await withContent(async (contentDir) => {
    await writeFile(
      path.join(contentDir, "draft.md"),
      '---\nversion: "0.05"\ntags: [private-topic]\n---\n',
    )
    await writeFile(
      path.join(contentDir, "ready.md"),
      '---\nversion: "0.1"\ntags: [public-topic]\n---\n',
    )
    assert.deepEqual(await syncFlatTagPages(contentDir, []), ["public-topic"])
  })
})

test("refuses to write descriptors when validation fails", async () => {
  await withContent(async (contentDir) => {
    await writeFile(
      path.join(contentDir, "monitoring.md"),
      '---\ntitle: Monitoring\nversion: "0.1"\ntags: [monitoring]\n---\n',
    )
    await assert.rejects(syncFlatTagPages(contentDir, []), /monitoring\.md.*tag:monitoring/is)
    await assert.rejects(access(path.join(contentDir, "_flat-tags")))
  })
})
