import assert from "node:assert/strict"
import { access, readdir, readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import YAML from "yaml"
import { isPublishableVersion } from "../plugins/version-publish/src/index"

const contentDirectory = path.join(process.cwd(), "content")
const articleExclusions = new Set(["index.md", "about.md", "projects.md"])
const mediaExtensions = /\.(?:avif|gif|jpe?g|png|svg|webp|mp3|mp4|wav|webm)$/i

export const isArticleFrontmatter = (data: Record<string, unknown>): boolean =>
  data.page !== true &&
  data.flatTag == null &&
  data.moc !== true &&
  isPublishableVersion(data.version)

const frontmatter = (markdown: string): Record<string, unknown> => {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  return match ? (YAML.parse(match[1]) ?? {}) : {}
}

const publishedArticles = async () => {
  const markdown = (await markdownFiles(contentDirectory)).filter(
    (file) => !articleExclusions.has(path.basename(file)),
  )
  const classified = await Promise.all(
    markdown.map(async (absolutePath) => ({
      file: path.relative(contentDirectory, absolutePath),
      data: frontmatter(await readFile(absolutePath, "utf8")),
    })),
  )
  return classified
    .filter(({ data }) => isArticleFrontmatter(data))
    .map(({ file }) => file)
    .sort((a, b) => a.localeCompare(b))
}

const normalizedValues = (value: unknown): string[] => {
  const values = Array.isArray(value) ? value : value == null ? [] : [value]
  return values.map((item) =>
    String(item)
      .replace(/^\[\[|\]\]$/g, "")
      .toLowerCase(),
  )
}

const markdownFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name)
      if (entry.isDirectory()) return markdownFiles(absolutePath)
      return entry.isFile() && entry.name.endsWith(".md") ? [absolutePath] : []
    }),
  )
  return nested.flat()
}

test("publishes only the 27 versioned articles ready for readers", async () => {
  const articles = await publishedArticles()
  assert.equal(articles.length, 27)

  for (const article of articles) {
    const data = frontmatter(await readFile(path.join(contentDirectory, article), "utf8"))
    assert.equal(isArticleFrontmatter(data), true, `${article} is not an article`)
  }
})

test("keeps excluded categories out", async () => {
  const forbiddenMetadata = new Set([
    "career",
    "карьера",
    "книги, фильмы, игры и спорт",
    "фильмы, сериалы, аниме и видеоигры",
    "games",
    "sports",
  ])

  for (const article of await publishedArticles()) {
    const data = frontmatter(await readFile(path.join(contentDirectory, article), "utf8"))
    const metadata = [
      ...normalizedValues(data.area),
      ...normalizedValues(data.tags),
      ...normalizedValues(data.category),
      ...normalizedValues(data.categories),
    ]
    assert.equal(
      metadata.some((value) => forbiddenMetadata.has(value)),
      false,
      `${article} belongs to an excluded category`,
    )
  }
})

test("has no published brain subdirectory", async () => {
  const brainDirectory = path.join(contentDirectory, "brain")
  await assert.rejects(access(brainDirectory))
})

test("resolves every local markdown embed", async () => {
  const files = await markdownFiles(contentDirectory)
  const availableAssets = new Set(
    (await readdir(path.join(contentDirectory, "assets"), { withFileTypes: true }))
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name.normalize("NFC")),
  )

  for (const file of files) {
    const markdown = await readFile(file, "utf8")
    const wikiEmbeds = [...markdown.matchAll(/!\[\[([^\]|#]+)(?:\|[^\]]+)?\]\]/g)].map((match) =>
      match[1].trim(),
    )
    const markdownEmbeds = [...markdown.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)]
      .map((match) => match[1].trim().replace(/^<|>$/g, ""))
      .filter((target) => !/^(?:https?:|data:)/i.test(target))

    for (const target of [...wikiEmbeds, ...markdownEmbeds].filter((item) =>
      mediaExtensions.test(item),
    )) {
      const assetName = path.basename(decodeURIComponent(target)).normalize("NFC")
      assert.equal(
        availableAssets.has(assetName),
        true,
        `${path.relative(contentDirectory, file)} references missing asset ${target}`,
      )
    }
  }
})
