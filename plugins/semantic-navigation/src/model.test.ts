import { describe, expect, it } from "vitest"
import {
  buildKnowledgeGraph,
  isMocPage,
  isPublishedArticle,
  isVisibleContentPage,
  validateKnowledgeGraph,
  type KnowledgeFile,
} from "./model"

const page = (slug: string, data: Partial<KnowledgeFile> = {}): KnowledgeFile => ({
  slug,
  frontmatter: { title: slug, ...data.frontmatter },
  ...data,
})

describe("knowledge page classification", () => {
  it("distinguishes articles, MOCs, system pages, and flat tag descriptors", () => {
    const article = page("proxy")
    const moc = page("network-security", { frontmatter: { moc: true } })
    const root = page("index", { frontmatter: { moc: true } })
    const about = page("about")
    const tag = page("public", { frontmatter: { flatTag: "public" } })

    expect(isPublishedArticle(article)).toBe(true)
    expect(isMocPage(article)).toBe(false)
    expect(isMocPage(moc)).toBe(true)
    expect(isPublishedArticle(moc)).toBe(false)
    expect(isMocPage(root)).toBe(true)
    expect(isPublishedArticle(root)).toBe(false)
    expect(isVisibleContentPage(about)).toBe(true)
    expect(isPublishedArticle(about)).toBe(false)
    expect(isVisibleContentPage(tag)).toBe(false)
  })

  it("excludes hidden and unlisted pages from the published model", () => {
    expect(isVisibleContentPage(page("hidden", { frontmatter: { hidden: true } }))).toBe(false)
    expect(isVisibleContentPage(page("unlisted", { unlisted: true }))).toBe(false)
  })
})

describe("buildKnowledgeGraph", () => {
  it("derives deduplicated reverse children from one or multiple up links", () => {
    const files = [
      page("index", { frontmatter: { moc: true } }),
      page("network", { frontmatter: { moc: true }, semanticUpLinks: ["index"] }),
      page("labs", { frontmatter: { moc: true }, semanticUpLinks: ["index"] }),
      page("proxy", { semanticUpLinks: ["network", "labs", "network"] }),
    ]

    const graph = buildKnowledgeGraph(files)
    expect([...graph.parents.get("proxy")!]).toEqual(["labs", "network"])
    expect([...graph.children.get("network")!]).toEqual(["proxy"])
    expect([...graph.children.get("labs")!]).toEqual(["proxy"])
  })

  it("does not use stored down links as hierarchy input", () => {
    const graph = buildKnowledgeGraph([
      page("index", { frontmatter: { moc: true }, semanticDownLinks: ["orphan"] }),
      page("orphan"),
    ])
    expect([...graph.children.get("index")!]).toEqual([])
    expect([...graph.parents.get("orphan")!]).toEqual([])
  })
})

describe("validateKnowledgeGraph", () => {
  it("reports missing parents, non-MOC parents, and unparented articles", () => {
    const diagnostics = validateKnowledgeGraph(
      [
        page("index", { frontmatter: { moc: true } }),
        page("plain-parent"),
        page("missing", { semanticUpLinks: ["does-not-exist"] }),
        page("wrong-kind", { semanticUpLinks: ["plain-parent"] }),
        page("orphan"),
      ],
      "index",
    )
    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing-parent",
          slug: "missing",
          target: "does-not-exist",
        }),
        expect.objectContaining({
          code: "parent-not-moc",
          slug: "wrong-kind",
          target: "plain-parent",
        }),
        expect.objectContaining({ code: "unparented-article", slug: "orphan" }),
      ]),
    )
  })

  it("reports self-links, multi-node cycles, and unreachable MOCs", () => {
    const diagnostics = validateKnowledgeGraph(
      [
        page("index", { frontmatter: { moc: true } }),
        page("self", { frontmatter: { moc: true }, semanticUpLinks: ["self"] }),
        page("a", { frontmatter: { moc: true }, semanticUpLinks: ["b"] }),
        page("b", { frontmatter: { moc: true }, semanticUpLinks: ["a"] }),
        page("unreachable", { frontmatter: { moc: true }, semanticUpLinks: ["index-missing"] }),
      ],
      "index",
    )
    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "self-reference", slug: "self", target: "self" }),
        expect.objectContaining({ code: "cycle", cycle: ["a", "b", "a"] }),
        expect.objectContaining({ code: "unreachable-moc", slug: "unreachable" }),
      ]),
    )
  })
})
