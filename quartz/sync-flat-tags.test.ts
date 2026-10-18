import assert from "node:assert/strict"
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { syncFlatTagPages } from "../scripts/sync-flat-tags"

test("flat route sync creates descriptors for tags and linked areas", async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "quartz-flat-routes-"))
  const content = path.join(temporaryRoot, "content")
  try {
    await mkdir(content)
    await writeFile(
      path.join(content, "Elastic.md"),
      `---\nversion: "0.1"\ntags: [monitoring]\narea: ["[[Инфраструктура]]"]\n---\n`,
    )
    const slugs = await syncFlatTagPages(content, ["404", "CNAME", "static"])
    assert.deepEqual(slugs, ["infrastruktura", "monitoring"])
    assert.match(
      await readFile(path.join(content, "_flat-tags", "infrastruktura.md"), "utf8"),
      /flatArea: true/,
    )
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true })
  }
})

test("flat route sync discovers tags in nested knowledge levels", async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "quartz-nested-flat-routes-"))
  const content = path.join(temporaryRoot, "content")
  try {
    const atomicNotes = path.join(content, "4-level-knowledge")
    await mkdir(atomicNotes, { recursive: true })
    await writeFile(
      path.join(atomicNotes, "Idea.md"),
      `---\nversion: "0.1"\ntags: [inspiration]\n---\nNested note\n`,
    )

    const slugs = await syncFlatTagPages(content, ["404", "CNAME", "static"])

    assert.deepEqual(slugs, ["inspiration"])
    await readFile(path.join(content, "_flat-tags", "inspiration.md"), "utf8")
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true })
  }
})

test("draft names do not reserve public tag routes", async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "quartz-draft-tag-routes-"))
  const content = path.join(temporaryRoot, "content")
  try {
    await mkdir(content)
    await writeFile(path.join(content, "Monitoring.md"), `---\nversion: "0.05"\n---\n`)
    await writeFile(
      path.join(content, "Published.md"),
      `---\nversion: "0.1"\ntags: [monitoring]\n---\n`,
    )
    assert.deepEqual(await syncFlatTagPages(content, ["404"]), ["monitoring"])
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true })
  }
})
