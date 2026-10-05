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
      `---\ntags: [monitoring]\narea: ["[[Инфраструктура]]"]\n---\n`,
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
