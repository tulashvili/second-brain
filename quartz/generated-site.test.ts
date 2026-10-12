import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { access, mkdtemp, readFile, readdir, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { promisify } from "node:util"
import YAML from "yaml"
import { toFlatAsciiSlug } from "../plugins/ascii-slug/src/slug"

const execFileAsync = promisify(execFile)
const contentDir = path.join(process.cwd(), "content")
const articleExclusions = new Set(["index.md", "about.md", "projects.md"])

const frontmatter = (markdown: string): Record<string, unknown> => {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  return match ? (YAML.parse(match[1]) ?? {}) : {}
}

const markdownFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      if (entry.name.startsWith(".") || entry.name === "_flat-tags" || entry.name === "assets") {
        return []
      }
      const absolutePath = path.join(directory, entry.name)
      if (entry.isDirectory()) return markdownFiles(absolutePath)
      return entry.isFile() && entry.name.endsWith(".md") ? [absolutePath] : []
    }),
  )
  return nested.flat().sort((left, right) => left.localeCompare(right))
}

const knowledgeSlugs = async (): Promise<{ articles: string[]; mocs: string[] }> => {
  const entries = await markdownFiles(contentDir)
  const files = await Promise.all(
    entries.map(async (absolutePath) => ({
      name: path.basename(absolutePath),
      slug: toFlatAsciiSlug(path.basename(absolutePath, ".md")),
      data: frontmatter(await readFile(absolutePath, "utf8")),
    })),
  )
  return {
    articles: files
      .filter(
        ({ name, data }) =>
          !articleExclusions.has(name) &&
          data.moc !== true &&
          data.page !== true &&
          data.flatTag == null,
      )
      .map(({ slug }) => slug)
      .sort(),
    mocs: files
      .filter(({ data }) => data.moc === true)
      .map(({ slug }) => slug)
      .sort(),
  }
}

const routeFor = (slug: string): string => (slug === "index" ? "" : slug)

const section = (html: string, className: string): string => {
  const start = html.indexOf(`class="${className}`)
  assert.notEqual(start, -1, `missing ${className} section`)
  const nextSection = html.indexOf("<section", start + 1)
  return html.slice(start, nextSection === -1 ? html.length : nextSection)
}

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

      const { articles, mocs } = await knowledgeSlugs()
      assert.equal(articles.length, 38)
      assert.equal(mocs.length, 16)
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
      for (const slug of mocs) {
        const route = routeFor(slug)
        await readFile(path.join(output, route ? `${route}.html` : "index.html"), "utf8")
      }

      const attackTypes = await readFile(
        path.join(output, "tipy-atak-na-informatsionnye-sistemy.html"),
        "utf8",
      )
      assert.match(
        attackTypes,
        /<a[^>]+href="\.\/r-u-d-y-r-u-dead-yet"[^>]*>R\.U\.D\.Y \(R-U-Dead-Yet\)<\/a>/,
      )

      const processes = await readFile(path.join(output, "protsessy-v-linux.html"), "utf8")
      assert.doesNotMatch(processes, /class="[^"]*broken-link[^"]*"/)
      const processImages = [...processes.matchAll(/\bsrc=["']([^"']+\.png)["']/gi)].map(
        (match) => match[1],
      )
      assert.equal(processImages.length, 8)
      for (const source of processImages) {
        const pathname = decodeURIComponent(
          new URL(source, "https://security.maybeso.me/protsessy-v-linux").pathname,
        )
        assert.match(pathname, /^\/assets\/pasted-image-2026101222\d{4}\.png$/)
        assert.equal(await exists(path.join(output, pathname.replace(/^\/+/, ""))), true)
      }

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

      for (const slug of articles) {
        const page = await readFile(path.join(output, `${slug}.html`), "utf8")
        assert.match(page, new RegExp(`https://security\\.maybeso\\.me/${slug}`))
        assert.match(
          page,
          new RegExp(`rel="canonical" href="https://security\\.maybeso\\.me/${slug}"`),
        )
      }
      for (const slug of mocs) {
        const route = routeFor(slug)
        const page = await readFile(
          path.join(output, route ? `${route}.html` : "index.html"),
          "utf8",
        )
        assert.match(
          page,
          new RegExp(`rel="canonical" href="https://security\\.maybeso\\.me/${route}"`),
        )
      }

      const searchIndex = JSON.parse(
        await readFile(path.join(output, "static", "contentIndex.json"), "utf8"),
      )
      for (const slug of articles) assert.ok(searchIndex[slug], `search index misses ${slug}`)
      for (const slug of mocs) assert.ok(searchIndex[slug], `search index misses MOC ${slug}`)
      for (const tag of tags) assert.ok(searchIndex[tag], `search index misses ${tag}`)
      const sitemap = await readFile(path.join(output, "sitemap.xml"), "utf8")
      const rss = await readFile(path.join(output, "index.xml"), "utf8")
      const rssLinks = [...rss.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>[\s\S]*?<\/item>/g)]
        .map((match) => match[1])
        .sort()
      assert.deepEqual(
        rssLinks,
        articles.map((slug) => `https://security.maybeso.me/${slug}`).sort(),
      )
      for (const slug of articles) {
        assert.match(sitemap, new RegExp(`https://security\\.maybeso\\.me/${slug}`))
        assert.match(rss, new RegExp(`https://security\\.maybeso\\.me/${slug}`))
      }
      for (const slug of mocs) {
        const route = routeFor(slug)
        assert.match(sitemap, new RegExp(`https://security\\.maybeso\\.me/${route}`))
        assert.doesNotMatch(rss, new RegExp(`https://security\\.maybeso\\.me/${route}(?:<|\")`))
      }

      const manifest = JSON.parse(
        await readFile(path.join(output, "static", "knowledgeStructure.json"), "utf8"),
      )
      assert.deepEqual(manifest.articleSlugs, articles)
      assert.deepEqual(manifest.mocSlugs, mocs)

      const recentArticles = section(rootPage, "recent-notes")
      for (const slug of mocs.filter((slug) => slug !== "index")) {
        assert.doesNotMatch(recentArticles, new RegExp(`href="(?:\\./|/)?${slug}"`))
      }

      const proxy = await readFile(path.join(output, "proxy.html"), "utf8")
      const proxyParents = section(proxy, "semantic-parents")
      assert.match(proxyParents, /aria-label="Родительские разделы"/)
      assert.match(proxyParents, /href="\/setevaya-bezopasnost"/)

      const practical = await readFile(
        path.join(output, "nastroyka-forward-proxy-v-nginx-c-basic-auth.html"),
        "utf8",
      )
      const practicalParents = section(practical, "semantic-parents")
      assert.match(practicalParents, /href="\/bezopasnost-prilozheniy-i-veb-servisov"/)
      assert.match(practicalParents, /href="\/laby-i-prakticheskie-rukovodstva"/)

      const networkMoc = await readFile(path.join(output, "setevaya-bezopasnost.html"), "utf8")
      const networkChildren = section(networkMoc, "moc-children")
      assert.match(networkChildren, /href="\/proxy"/)
      assert.match(networkChildren, /href="\/cdn"/)
      assert.match(networkChildren, /href="\/seti-i-protokoly"/)
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true })
    }
  },
)
