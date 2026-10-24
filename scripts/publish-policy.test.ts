import assert from "node:assert/strict"
import { mkdtemp, readFile, readdir, rm, writeFile, mkdir } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { filterUnpublishedNotes } from "./publish-policy"

test("only explicit draft:false notes reach the build input; assets remain available", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "quartz-publish-policy-"))
  try {
    const notes = path.join(root, "notes")
    const assets = path.join(root, "assets")
    await mkdir(notes)
    await mkdir(assets)
    await writeFile(path.join(notes, "published.md"), "---\ndraft: false\n---\nPublished\n")
    await writeFile(path.join(notes, "draft.md"), "---\ndraft: true\n---\nPrivate\n")
    await writeFile(path.join(notes, "missing.md"), "---\ntitle: Missing\n---\nPrivate\n")
    await writeFile(path.join(notes, "string.md"), '---\ndraft: "false"\n---\nPrivate\n')
    await writeFile(path.join(assets, "diagram.png"), "image")

    await filterUnpublishedNotes(root)

    assert.deepEqual(await readdir(notes), ["published.md"])
    assert.equal(await readFile(path.join(assets, "diagram.png"), "utf8"), "image")
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
