import { render } from "preact-render-to-string"
import { describe, expect, it } from "vitest"
import { MocChildren } from "./MocChildren"
import { SemanticGraph } from "./SemanticGraph"
import { SemanticParents } from "./SemanticParents"
import { SemanticNavigation } from "./components"

const renderComponent = (
  constructor: typeof SemanticGraph,
  fileData: Record<string, unknown>,
  allFiles: Record<string, unknown>[],
  locale = "ru-RU",
) => {
  const output = constructor()({ fileData, allFiles, cfg: { locale } } as never)
  return output == null ? "" : render(output as Parameters<typeof render>[0])
}

const moc = (slug: string, title: string, semanticUpLinks: string[] = []) => ({
  slug,
  frontmatter: { title, moc: true },
  semanticUpLinks,
})

describe("SemanticParents", () => {
  const network = moc("network", "Сетевая безопасность", ["index"])
  const labs = moc("labs", "Лаборатории", ["index"])
  const root = moc("index", "Информационная безопасность")
  const files = [root, network, labs]

  it("renders one resolved MOC parent for an article", () => {
    const html = renderComponent(
      SemanticParents,
      { slug: "proxy", frontmatter: { title: "Proxy" }, semanticUpLinks: ["network"] },
      files,
    )
    expect(html).toContain('aria-label="Родительские разделы"')
    expect(html).toContain('href="/network"')
    expect(html).toContain("Сетевая безопасность")
  })

  it("renders multiple parents once and ignores unresolved or non-MOC parents", () => {
    const html = renderComponent(
      SemanticParents,
      {
        slug: "guide",
        frontmatter: { title: "Guide" },
        semanticUpLinks: ["network", "labs", "network", "missing", "plain"],
      },
      [...files, { slug: "plain", frontmatter: { title: "Plain" } }],
    )
    expect(html.match(/href="\/network"/g)).toHaveLength(1)
    expect(html.match(/href="\/labs"/g)).toHaveLength(1)
    expect(html).not.toContain("missing")
    expect(html).not.toContain("Plain")
  })

  it("keeps English links and labels under /en/", () => {
    const html = renderComponent(
      SemanticParents,
      { slug: "proxy", frontmatter: {}, semanticUpLinks: ["network"] },
      files,
      "en-US",
    )
    expect(html).toContain('aria-label="Parent sections"')
    expect(html).toContain('href="/en/network"')
  })

  it("renders nothing for the root or a page without parents", () => {
    expect(renderComponent(SemanticParents, root, files)).toBe("")
    expect(renderComponent(SemanticParents, { slug: "orphan", frontmatter: {} }, files)).toBe("")
  })
})

describe("MocChildren", () => {
  const network = moc("network", "Сетевая безопасность", ["index"])
  const files = [
    moc("index", "Информационная безопасность"),
    network,
    { slug: "proxy", frontmatter: { title: "Proxy" }, semanticUpLinks: ["network", "network"] },
    { slug: "cdn", frontmatter: { title: "CDN" }, semanticUpLinks: ["network"] },
    { slug: "other", frontmatter: { title: "Other" }, semanticUpLinks: ["index"] },
  ]

  it("renders deduplicated direct children on a MOC in title order", () => {
    const html = renderComponent(MocChildren, network, files)
    expect(html).toContain("Все заметки раздела")
    expect(html.match(/href="\/proxy"/g)).toHaveLength(1)
    expect(html.indexOf("CDN")).toBeLessThan(html.indexOf("Proxy"))
    expect(html).not.toContain("Other")
  })

  it("renders nothing on an article or an empty MOC", () => {
    expect(renderComponent(MocChildren, files[2], files)).toBe("")
    expect(renderComponent(MocChildren, moc("empty", "Empty", ["index"]), files)).toBe("")
  })
})

describe("SemanticGraph", () => {
  it("renders only the index-rooted semantic tree", () => {
    const root = moc("index", "Информационная безопасность")
    const files = [
      root,
      moc("network", "Сетевая безопасность", ["index"]),
      { slug: "proxy", frontmatter: { title: "Proxy" }, semanticUpLinks: ["network"] },
      moc("disconnected", "Disconnected"),
    ]
    const html = renderComponent(SemanticGraph, root, files)
    expect(html).toContain('href="/"')
    expect(html).toContain('href="/network"')
    expect(html).toContain('href="/proxy"')
    expect(html).not.toContain("Disconnected")
    expect(renderComponent(SemanticGraph, files[1], files)).toBe("")
  })

  it("renders an invalid reachable cycle finitely with a marker", () => {
    const root = moc("index", "Root")
    const files = [root, moc("a", "A", ["index", "b"]), moc("b", "B", ["a"])]
    const html = renderComponent(SemanticGraph, root, files)
    expect(html).toContain("semantic-cycle")
    expect(html.length).toBeLessThan(4000)
  })
})

describe("SemanticNavigation", () => {
  it("does not duplicate parent links below the article", () => {
    const root = moc("index", "Root")
    const network = moc("network", "Network", ["index"])
    const html = renderComponent(
      SemanticNavigation,
      { slug: "proxy", frontmatter: { title: "Proxy" }, semanticUpLinks: ["network"] },
      [root, network],
    )
    expect(html).not.toContain("semantic-parents")
  })

  it("keeps the article-only recent block on the root MOC", () => {
    const root = moc("index", "Информационная безопасность")
    const html = renderComponent(SemanticNavigation, root, [
      root,
      moc("network", "Сетевая безопасность", ["index"]),
      { slug: "proxy", frontmatter: { title: "Proxy" }, semanticUpLinks: ["network"] },
    ])
    expect(html).toContain('class="recent-notes"')
    expect(html).toContain('href="./proxy"')
  })
})
