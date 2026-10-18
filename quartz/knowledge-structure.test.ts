import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import YAML from "yaml"
import { toAsciiSlug, toFlatAsciiSlug } from "../plugins/ascii-slug/src/slug"
import { extractSemanticTargets } from "../plugins/semantic-navigation/src/semanticLinks"
import { isPublishableVersion } from "../plugins/version-publish/src/index"
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

const contentDir = path.join(process.cwd(), "content")

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

test("every note has assessed version and a valid place in the four-level hierarchy", async () => {
  const pages = await loadPages()
  const articles = pages.filter(isPublishedArticle)
  const mocs = pages.filter(isMocPage)

  assert.equal(pages.length, articles.length + mocs.length)
  assert.ok(mocs.some((page) => page.fileName === "index.md"))
  assert.equal(
    new Set(pages.map((page) => page.fileName.normalize("NFC"))).size,
    pages.length,
    "note names must stay unique across folders for flat public routes",
  )

  const levelByName = new Map(
    mocs.map((moc) => [
      (moc.fileName === "index.md" ? "index" : moc.fileName.replace(/\.md$/, "")).normalize("NFC"),
      moc.fileName === "index.md" ? 0 : Number(path.dirname(moc.relativePath)[0]),
    ]),
  )

  for (const page of pages) {
    const name = page.fileName.replace(/\.md$/, "")
    const version = page.frontmatter?.version
    assert.match(String(version), /^\d+(?:\.\d+)*$/, `${name} needs version`)
    if (name === "index") {
      assert.equal(path.dirname(page.relativePath), ".")
      assert.equal(isPublishableVersion(version), true)
      continue
    }

    assert.ok(page.rawParents.length > 0, `${name} needs a parent MOC`)
    if (isMocPage(page)) {
      assert.match(path.dirname(page.relativePath), /^[1-3]-level-knowledge$/, `${name} level`)
      assert.ok(String(page.frontmatter?.title ?? "").trim(), `${name} needs a title`)
      assert.deepEqual(page.frontmatter?.tags, ["area"])
      for (const parent of page.rawParents) {
        const parentLevel = levelByName.get(parent.normalize("NFC"))
        assert.equal(parentLevel, Number(path.dirname(page.relativePath)[0]) - 1, `${name} parent`)
      }
    } else {
      assert.equal(path.dirname(page.relativePath), "4-level-knowledge", `${name} level`)
      assert.equal(Object.hasOwn(page.frontmatter ?? {}, "down"), false, `${name} stores down`)
    }
  }

  assert.deepEqual(validateKnowledgeGraph(pages, "index"), [])
})

test("only notes with version 0.1 or newer pass the publication rule", async () => {
  const pages = await loadPages()
  const publicPages = pages.filter((page) => isPublishableVersion(page.frontmatter?.version))
  const drafts = pages.filter((page) => !isPublishableVersion(page.frontmatter?.version))
  assert.ok(publicPages.length > 0)
  assert.ok(drafts.length > 0)
  assert.ok(publicPages.some((page) => page.fileName === "index.md"))
  for (const page of drafts) {
    assert.equal(isPublishableVersion(page.frontmatter?.version), false, page.fileName)
  }
})
