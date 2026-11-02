import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import YAML from "yaml"
import { toAsciiSlug, toFlatAsciiSlug } from "../plugins/ascii-slug/src/slug"
import { extractSemanticTargets } from "../plugins/semantic-navigation/src/semanticLinks"
import {
  isMocPage,
  isPublishedArticle,
  validateKnowledgeGraph,
  type KnowledgeFile,
} from "../plugins/semantic-navigation/src/model"

type ContentPage = KnowledgeFile & {
  fileName: string
  relativePath: string
  markdown: string
  rawParents: string[]
}

const contentDir = path.join(process.cwd(), "content", "ru")

const parseFrontmatter = (markdown: string): Record<string, unknown> => {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  return match ? (YAML.parse(match[1]) ?? {}) : {}
}

const inlineSemanticTargets = (markdown: string, direction: "up" | "down"): string[] =>
  extractSemanticTargets(
    [...markdown.matchAll(new RegExp(`^\\s*${direction}\\s*::\\s*(.+)$`, "gim"))].map(
      (match) => match[1],
    ),
  )

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

const loadPages = async (): Promise<ContentPage[]> => {
  const files = await markdownFiles(contentDir)
  return Promise.all(
    files.map(async (absolutePath) => {
      const relativePath = path.relative(contentDir, absolutePath)
      const fileName = path.basename(relativePath)
      const markdown = await readFile(absolutePath, "utf8")
      const frontmatter = parseFrontmatter(markdown)
      const rawParents = [
        ...new Set([
          ...extractSemanticTargets(frontmatter.up),
          ...inlineSemanticTargets(markdown, "up"),
        ]),
      ]
      const baseName = fileName.replace(/\.md$/, "")
      return {
        fileName,
        markdown,
        relativePath,
        slug: baseName === "index" ? "index" : toFlatAsciiSlug(baseName),
        frontmatter,
        rawParents,
        semanticUpLinks: rawParents.map(toAsciiSlug),
      }
    }),
  )
}

const sorted = (values: readonly string[]): string[] =>
  values.map((value) => value.normalize("NFC")).sort((left, right) => left.localeCompare(right))

test("knowledge structure matches the approved Ignis release hierarchy", async () => {
  const pages = await loadPages()
  const articles = pages.filter(isPublishedArticle)
  const mocs = pages.filter(isMocPage)
  const baseline = JSON.parse(
    await readFile(path.join(process.cwd(), "docs/localization/published-baseline.json"), "utf8"),
  ) as { pages: { source: string; kind: "article" | "moc" }[] }
  const expectedPages = new Map(
    baseline.pages.map((page) => [
      page.source.replace(/^content\//, "").normalize("NFC"),
      page.kind,
    ]),
  )

  assert.equal(articles.length, 62)
  assert.equal(mocs.length, 23)
  assert.equal(pages.filter((page) => isMocPage(page) || isPublishedArticle(page)).length, 85)
  assert.deepEqual(
    sorted(
      pages
        .filter((page) => isMocPage(page) || isPublishedArticle(page))
        .map((page) => page.relativePath),
    ),
    sorted([...expectedPages.keys()]),
  )

  for (const page of pages.filter((page) => isMocPage(page) || isPublishedArticle(page))) {
    assert.equal(
      isMocPage(page) ? "moc" : "article",
      expectedPages.get(page.relativePath.normalize("NFC")),
      page.relativePath,
    )
    assert.deepEqual(
      inlineSemanticTargets(page.markdown, "down"),
      [],
      `${page.relativePath} stores inline down`,
    )
    assert.equal(
      Object.hasOwn(page.frontmatter ?? {}, "area"),
      false,
      `${page.relativePath} retains area`,
    )
  }

  assert.deepEqual(validateKnowledgeGraph(pages, "index"), [
    { code: "unparented-moc", slug: "osnovy-arhitektury-kompyutera" },
    { code: "unparented-moc", slug: "osnovy-programmirovaniya" },
    { code: "unparented-article", slug: "algoritm" },
    { code: "unparented-article", slug: "non-repudiation" },
    { code: "missing-parent", slug: "pki-public-key-infrastructure", target: "kriptografiya" },
    { code: "unparented-article", slug: "tri-a-aaa-authentication-authorization-i-accounting" },
    { code: "unparented-article", slug: "utechka-dannyh-equifax-2017" },
    { code: "unparented-article", slug: "tsifrovaya-podpis" },
    { code: "unreachable-moc", slug: "osnovy-arhitektury-kompyutera" },
    { code: "unreachable-moc", slug: "osnovy-programmirovaniya" },
    { code: "unreachable-moc", slug: "rabota-kompyutera-s-informatsiey" },
    { code: "unreachable-moc", slug: "sistema-schisleniya" },
    { code: "unreachable-moc", slug: "upravlenie-posledovatelnostyu-deystviy" },
    { code: "unreachable-moc", slug: "yazyk-programmirovaniya-pascal" },
  ])
})
