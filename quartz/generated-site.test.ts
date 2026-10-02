import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { access, mkdtemp, readFile, readdir, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { promisify } from "node:util"
import { toAsciiSlug } from "../plugins/ascii-slug/src/slug"

const execFileAsync = promisify(execFile)
const contentDir = path.join(process.cwd(), "content")
const articleExclusions = new Set(["index.md", "about.md", "projects.md"])

const articleSlugs = async (): Promise<string[]> =>
  (await readdir(contentDir, { withFileTypes: true }))
    .filter(
      (entry) => entry.isFile() && entry.name.endsWith(".md") && !articleExclusions.has(entry.name),
    )
    .map((entry) => toAsciiSlug(entry.name.replace(/\.md$/, "")))
    .sort()

const exists = async (candidate: string): Promise<boolean> =>
  access(candidate).then(
    () => true,
    () => false,
  )

const assertInternalHrefsResolve = async (output: string, fileName: string): Promise<void> => {
  const html = await readFile(path.join(output, fileName), "utf8")
  const sourcePath = fileName === "index.html" ? "/" : `/${fileName.replace(/\.html$/, "")}`
  for (const match of html.matchAll(/\bhref=["']([^"']+)["']/gi)) {
    const href = match[1]
    if (href.startsWith("#") || /^(?:data|mailto|tel|javascript):/i.test(href)) continue
    const destination = new URL(href, `https://security.maybeso.me${sourcePath}`)
    if (destination.origin !== "https://security.maybeso.me") continue
    const pathname = decodeURIComponent(destination.pathname)
    const relative = pathname.replace(/^\/+/, "")
    const candidates =
      relative.length === 0
        ? [path.join(output, "index.html")]
        : [
            path.join(output, relative),
            path.join(output, `${relative}.html`),
            path.join(output, relative, "index.html"),
          ]
    assert.ok(
      (await Promise.all(candidates.map(exists))).some(Boolean),
      `${fileName} contains unresolved internal href ${href}`,
    )
  }
}

test(
  "production site exposes only flat canonical content routes",
  { timeout: 120_000 },
  async () => {
    const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "quartz-v5-site-"))
    const output = path.join(temporaryRoot, "public")
    try {
      await execFileAsync("npx", ["quartz", "build", "--output", output], {
        cwd: process.cwd(),
        env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH ?? ""}` },
      })

      const articles = await articleSlugs()
      assert.equal(articles.length, 33)
      const rootPage = await readFile(path.join(output, "index.html"), "utf8")
      assert.match(rootPage, /property="og:url" content="https:\/\/security\.maybeso\.me\/"/)
      assert.match(rootPage, /rel="canonical" href="https:\/\/security\.maybeso\.me\/"/)
      assert.doesNotMatch(
        rootPage,
        /property="(?:og|twitter):url" content="https:\/\/security\.maybeso\.me\/index"/,
      )
      const notFoundPage = await readFile(path.join(output, "404.html"), "utf8")
      assert.doesNotMatch(notFoundPage, /rel="canonical"/)
      for (const slug of articles) await readFile(path.join(output, `${slug}.html`), "utf8")

      const attackTypes = await readFile(
        path.join(output, "tipy-atak-na-informatsionnye-sistemy.html"),
        "utf8",
      )
      assert.match(
        attackTypes,
        /<a[^>]+href="\.\/r-u-d-y-r-u-dead-yet"[^>]*>R\.U\.D\.Y \(R-U-Dead-Yet\)<\/a>/,
      )

      const tagDescriptors = await readdir(path.join(contentDir, "_flat-tags"))
      const tags = tagDescriptors.map((file) => file.replace(/\.md$/, "")).sort()
      for (const tag of tags) {
        const tagPage = await readFile(path.join(output, `${tag}.html`), "utf8")
        assert.match(
          tagPage,
          new RegExp(`rel="canonical" href="https://security\\.maybeso\\.me/${tag}"`),
        )
      }
      await assert.rejects(readdir(path.join(output, "brain")))
      await assert.rejects(readdir(path.join(output, "tags")))

      const htmlFiles = (await readdir(output)).filter((file) => file.endsWith(".html"))
      for (const file of htmlFiles) await assertInternalHrefsResolve(output, file)
      const html = await Promise.all(
        htmlFiles.map((file) => readFile(path.join(output, file), "utf8")),
      )
      assert.equal(
        html.some((page) => /http-equiv=["']refresh/i.test(page)),
        false,
      )
      assert.equal(
        html.some((page) => /href=["'][^"']*\/(?:brain|tags)\//i.test(page)),
        false,
      )

      for (const slug of articles.slice(0, 3)) {
        const page = await readFile(path.join(output, `${slug}.html`), "utf8")
        assert.match(page, new RegExp(`https://security\\.maybeso\\.me/${slug}`))
        assert.match(
          page,
          new RegExp(`rel="canonical" href="https://security\\.maybeso\\.me/${slug}"`),
        )
      }

      const searchIndex = JSON.parse(
        await readFile(path.join(output, "static", "contentIndex.json"), "utf8"),
      )
      for (const slug of articles) assert.ok(searchIndex[slug], `search index misses ${slug}`)
      for (const tag of tags) assert.ok(searchIndex[tag], `search index misses ${tag}`)
      const sitemap = await readFile(path.join(output, "sitemap.xml"), "utf8")
      const rss = await readFile(path.join(output, "index.xml"), "utf8")
      for (const slug of articles) {
        assert.match(sitemap, new RegExp(`https://security\\.maybeso\\.me/${slug}`))
        assert.match(rss, new RegExp(`https://security\\.maybeso\\.me/${slug}`))
      }
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true })
    }
  },
)
