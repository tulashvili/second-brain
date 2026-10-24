import { readdir, readFile, rm, mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"
import YAML from "yaml"
import {
  canonicalTagSlug,
  collectRouteClaims,
  validateRouteClaims,
  type ArticleRoute,
} from "../plugins/flat-tag-page/src/routes"

const parseFrontmatter = (markdown: string): Record<string, unknown> => {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  return match ? (YAML.parse(match[1]) ?? {}) : {}
}

const tagsFrom = (frontmatter: Record<string, unknown>): string[] => {
  const value = frontmatter.tags ?? frontmatter.tag
  const values = Array.isArray(value) ? value : value == null ? [] : [value]
  return values
    .map(String)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

const areasFrom = (frontmatter: Record<string, unknown>): string[] => {
  const values = Array.isArray(frontmatter.area)
    ? frontmatter.area
    : frontmatter.area == null
      ? []
      : [frontmatter.area]
  return values
    .map(String)
    .map((value) => value.match(/^\[\[([^\]|]+)(?:\|[^\]]+)?\]\]$/)?.[1] ?? value)
    .map((area) => area.trim())
    .filter(Boolean)
}

const yamlScalar = (value: string): string =>
  /^[\p{L}\p{N} _-]+$/u.test(value) ? value : JSON.stringify(value)

const findMarkdownFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      if (entry.name.startsWith(".") || entry.name === "_flat-tags" || entry.name === "assets") {
        return []
      }
      const absolutePath = path.join(directory, entry.name)
      if (entry.isDirectory()) return findMarkdownFiles(absolutePath)
      return entry.isFile() && entry.name.endsWith(".md") ? [absolutePath] : []
    }),
  )
  return nested.flat().sort((left, right) => left.localeCompare(right))
}

export const syncFlatTagPages = async (
  contentDir: string,
  reserved: readonly string[],
): Promise<string[]> => {
  const absoluteContentDir = path.resolve(contentDir)
  const markdownFiles = await findMarkdownFiles(absoluteContentDir)

  const articles: ArticleRoute[] = []
  const displayTags = new Map<string, string>()
  const rawTags = new Set<string>()
  const areaSlugs = new Set<string>()

  for (const absolutePath of markdownFiles) {
    const source = path.relative(absoluteContentDir, absolutePath)
    const markdown = await readFile(absolutePath, "utf8")
    const data = parseFrontmatter(markdown)
    if (data.draft !== false) continue
    const slug = path.basename(absolutePath, ".md")
    articles.push({ slug, source })

    for (const tag of tagsFrom(data)) {
      rawTags.add(tag)
      const canonical = canonicalTagSlug(tag)
      if (!displayTags.has(canonical)) displayTags.set(canonical, tag)
    }
    for (const area of areasFrom(data)) {
      rawTags.add(area)
      const canonical = canonicalTagSlug(area)
      areaSlugs.add(canonical)
      if (!displayTags.has(canonical)) displayTags.set(canonical, area)
    }
  }

  const sortedRawTags = [...rawTags].sort((left, right) => left.localeCompare(right))
  validateRouteClaims(collectRouteClaims(articles, sortedRawTags, reserved))

  // Quartz's content glob intentionally skips dot-directories. Keep generated
  // descriptors in a visible implementation namespace and flatten their
  // public slugs in FlatTagRoutes.
  const descriptorDir = path.join(absoluteContentDir, "_flat-tags")
  await rm(descriptorDir, { recursive: true, force: true })

  const slugs = [...displayTags.keys()].sort((left, right) => left.localeCompare(right))
  if (slugs.length === 0) return []

  await mkdir(descriptorDir, { recursive: true })
  await Promise.all(
    slugs.map(async (slug) => {
      const title = displayTags.get(slug)!
      const area = areaSlugs.has(slug) ? "flatArea: true\n" : ""
      const descriptor = `---\ndraft: false\nflatTag: ${slug}\n${area}title: ${yamlScalar(title)}\ngenerated: true\n---\n`
      await writeFile(path.join(descriptorDir, `${slug}.md`), descriptor)
    }),
  )
  return slugs
}

const runCli = async (): Promise<void> => {
  const contentIndex = process.argv.indexOf("--content")
  const requested = contentIndex >= 0 ? process.argv[contentIndex + 1] : "content/ru"
  if (!requested) throw new Error("--content requires a path")

  const contentDir = path.resolve(requested)
  if (
    !["ru", "en"].includes(path.basename(contentDir)) ||
    path.dirname(contentDir) !== path.resolve("content")
  ) {
    throw new Error(`Refusing to write outside content/ru or content/en: ${contentDir}`)
  }

  const slugs = await syncFlatTagPages(contentDir, [
    "404",
    "CNAME",
    "index.xml",
    "sitemap.xml",
    "static",
  ])
  console.log(`Synced ${slugs.length} flat tag descriptors`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runCli()
}
