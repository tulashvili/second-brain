import assert from "node:assert/strict"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import test from "node:test"
import YAML from "yaml"
import { toFlatAsciiSlug } from "../plugins/ascii-slug/src/slug"

test("authored content is split into Russian and English source trees", () => {
  const root = path.join(process.cwd(), "content")
  assert.ok(existsSync(path.join(root, "ru")), "Russian content root is missing")
  assert.ok(existsSync(path.join(root, "en")), "English content root is missing")
  assert.deepEqual(
    readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort(),
    ["en", "ru"],
  )
})

test("each published Russian note has exactly one keyed English counterpart", () => {
  const baseline = JSON.parse(
    readFileSync("docs/localization/published-baseline.json", "utf8"),
  ) as { pages: { source: string; url: string; slug: string }[] }
  const mapPath = "localization/route-pairs.json"
  assert.ok(existsSync(mapPath), "reviewed translation map is missing")
  const pairs = JSON.parse(readFileSync(mapPath, "utf8")) as Record<
    string,
    { ruPath: string; enPath: string; ruUrl: string; enUrl: string }
  >
  assert.equal(Object.keys(pairs).length, 54)
  assert.equal(new Set(Object.values(pairs).map((pair) => pair.enUrl)).size, 54)

  for (const page of baseline.pages) {
    const pair = pairs[page.slug]
    assert.ok(pair, `missing translation for ${page.slug}`)
    assert.equal(pair.ruPath, page.source.replace(/^content\//, "content/ru/"))
    assert.equal(pair.ruUrl, page.url)
    assert.match(pair.enPath, /^content\/en\/[^/]+\.md$|^content\/en\/[^/]+\/[^/]+\.md$/)
    assert.equal(
      pair.enUrl,
      `https://security.maybeso.me/en/${toFlatAsciiSlug(path.basename(pair.enPath, ".md")) === "index" ? "" : toFlatAsciiSlug(path.basename(pair.enPath, ".md"))}`,
    )
    assert.ok(existsSync(pair.ruPath), `missing Russian source ${pair.ruPath}`)
    assert.ok(existsSync(pair.enPath), `missing English source ${pair.enPath}`)

    for (const [locale, file] of [
      ["ru", pair.ruPath],
      ["en", pair.enPath],
    ]) {
      const source = readFileSync(file, "utf8")
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
      assert.ok(match, `${locale} frontmatter missing: ${file}`)
      const metadata = YAML.parse(match[1])
      assert.equal(metadata.translationKey, page.slug)
      assert.notEqual(metadata.translationPending, true, `translation is pending: ${file}`)
    }
  }
})
