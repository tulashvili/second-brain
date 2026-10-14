import assert from "node:assert/strict"
import { mkdtempSync, rmSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"
import test from "node:test"

test("build rejects an explicit configuration file that does not exist", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "quartz-config-option-"))
  try {
    const result = spawnSync(
      "npx",
      [
        "quartz",
        "build",
        "--config",
        path.join(root, "absent.yaml"),
        "--directory",
        "content/ru",
        "--output",
        path.join(root, "public"),
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH ?? ""}` },
        timeout: 120_000,
      },
    )
    assert.equal(result.status, 1)
    assert.match(result.stderr + result.stdout, /configuration file not found/i)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
