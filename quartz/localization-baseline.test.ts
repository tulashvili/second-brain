import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import test from "node:test"
import { toFlatAsciiSlug } from "../plugins/ascii-slug/src/slug"

type BaselinePage = {
  source: string
  url: string
  slug: string
  kind: "article" | "moc"
}

test("published baseline captures every original Russian note and its stable URL", () => {
  const file = path.join(process.cwd(), "docs/localization/published-baseline.json")
  assert.ok(existsSync(file), "published baseline is missing")

  const baseline = JSON.parse(readFileSync(file, "utf8")) as {
    sourceCommit: string
    liveSitemapCount: number
    counts: { article: number; moc: number; page: number }
    pages: BaselinePage[]
  }
  const committedFiles = execFileSync(
    "git",
    ["ls-tree", "-r", "--name-only", "-z", baseline.sourceCommit, "content"],
  )
    .toString("utf8")
    .split("\0")
    .filter((source) => source.endsWith(".md") && !source.includes("/_flat-tags/"))
    .map((source) => source.normalize("NFC"))
    .sort()

  assert.equal(baseline.liveSitemapCount, 68)
  assert.equal(baseline.pages.length, 54)
  assert.deepEqual(
    baseline.pages.map((page) => page.source.normalize("NFC")).sort(),
    committedFiles,
  )
  assert.equal(new Set(baseline.pages.map((page) => page.url)).size, 54)
  assert.deepEqual(baseline.counts, { article: 38, moc: 16, page: 0 })

  for (const page of baseline.pages) {
    assert.equal(page.slug, toFlatAsciiSlug(path.basename(page.source, ".md")))
    assert.equal(
      page.url,
      `https://security.maybeso.me/${page.slug === "index" ? "" : page.slug}`,
    )
    assert.ok(page.kind === "article" || page.kind === "moc")
  }
  assert.ok(baseline.pages.some((page) => page.url.endsWith("/ssl-upstream-injection")))
  assert.ok(baseline.pages.some((page) => page.url === "https://security.maybeso.me/"))
})
