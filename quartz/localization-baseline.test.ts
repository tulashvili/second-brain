import assert from "node:assert/strict"
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
    source: string
    snapshot: string
    counts: { article: number; moc: number; page: number }
    pages: BaselinePage[]
  }
  const sourceManifest = JSON.parse(
    readFileSync("docs/localization/ignis-source-manifest.json", "utf8"),
  ) as { vault: string; files: Record<string, string> }
  const manifestFiles = Object.keys(sourceManifest.files)
    .filter((source) => source.endsWith(".md") && !source.includes("/_flat-tags/"))
    .map((source) => `content/${source}`.normalize("NFC"))
    .sort()

  assert.ok(!baseline.pages.some((page) => page.slug === "ddos-ataka"))
  assert.ok(!existsSync("content/ru/DDoS-атака.md"))
  assert.ok(!existsSync("content/en/ddos-attack.md"))

  assert.ok(baseline.pages.some((page) => page.slug === "405-kod-otveta"))
  assert.ok(!baseline.pages.some((page) => page.slug === "nelineynye-vychisleniya"))
  assert.ok(
    !baseline.pages.some((page) =>
      ["php2shell", "assimetrichnoe-i-simmetr-shifrovanie"].includes(page.slug),
    ),
  )

  assert.equal(baseline.source, "Ignis API vault content")
  assert.equal(baseline.snapshot, "2026-11-02")
  assert.equal(baseline.pages.length, 67)
  assert.deepEqual(baseline.pages.map((page) => page.source.normalize("NFC")).sort(), manifestFiles)
  assert.equal(new Set(baseline.pages.map((page) => page.url)).size, 67)
  assert.deepEqual(baseline.counts, { article: 45, moc: 22 })

  for (const page of baseline.pages) {
    assert.equal(page.slug, toFlatAsciiSlug(path.basename(page.source, ".md")))
    assert.equal(page.url, `https://security.maybeso.me/${page.slug === "index" ? "" : page.slug}`)
    assert.ok(page.kind === "article" || page.kind === "moc")
    assert.ok(existsSync(page.source.replace(/^content\//, "content/ru/")))
  }
  assert.ok(baseline.pages.some((page) => page.url.endsWith("/ssl-upstream-injection")))
  assert.ok(baseline.pages.some((page) => page.url === "https://security.maybeso.me/"))
})
