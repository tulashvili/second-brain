import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

test("turns fenced PlantUML into a locally renderable diagram container", async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "quartz-plantuml-"))
  const contentDirectory = path.join(temporaryRoot, "content")
  const outputDirectory = path.join(temporaryRoot, "public")
  const notePath = path.join(contentDirectory, "diagram.md")

  try {
    await mkdir(contentDirectory, { recursive: true })
    await writeFile(
      notePath,
      [
        "---",
        "draft: false",
        "title: Diagram",
        "---",
        "",
        "```plantuml",
        "@startuml",
        "Alice -> Bob: Привет",
        "@enduml",
        "```",
      ].join("\n"),
    )

    await execFileAsync(
      "npx",
      ["quartz", "build", "--directory", contentDirectory, "--output", outputDirectory],
      {
        cwd: process.cwd(),
        env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH ?? ""}` },
      },
    )

    const html = await readFile(path.join(outputDirectory, "diagram.html"), "utf8")
    assert.match(html, /class="plantuml-diagram"/)
    assert.match(html, /Alice -> Bob: Привет/)
    assert.doesNotMatch(html, /language-plantuml/)
    assert.doesNotMatch(html, /plantuml\.com|plantuml\.server|kroki\.io/)

    for (const asset of [
      "plantuml.js",
      "viz-global.js",
      "themes.js",
      "emoji.js",
      "openiconic.js",
    ]) {
      const assetPath = path.join(outputDirectory, "static", "plantuml", asset)
      assert.ok((await stat(assetPath)).size > 0, `${asset} should be emitted locally`)
    }
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true })
  }
})
