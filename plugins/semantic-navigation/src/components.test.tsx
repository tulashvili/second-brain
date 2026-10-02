import { render } from "preact-render-to-string"
import { describe, expect, it } from "vitest"
import { AreaBacklinkNotes } from "./AreaBacklinkNotes"
import { SemanticGraph } from "./SemanticGraph"

const renderComponent = (
  constructor: typeof SemanticGraph,
  fileData: Record<string, unknown>,
  allFiles: Record<string, unknown>[],
) => {
  const output = constructor()({ fileData, allFiles, cfg: {} } as never)
  return output == null ? "" : render(output as Parameters<typeof render>[0])
}

describe("SemanticGraph", () => {
  const files = [
    { slug: "root", frontmatter: { title: "Root" }, semanticDownLinks: ["child"] },
    { slug: "child", frontmatter: { title: "Child" } },
    { slug: "hidden", unlisted: true, frontmatter: { title: "Hidden" }, semanticUpLinks: ["root"] },
  ]

  it("renders visible semantic nodes only on the root page with flat hrefs", () => {
    const html = renderComponent(
      SemanticGraph,
      { slug: "index", frontmatter: { title: "Home" } },
      files,
    )
    expect(html).toContain('href="/root"')
    expect(html).toContain('href="/child"')
    expect(html).not.toContain("Hidden")
    expect(renderComponent(SemanticGraph, { slug: "root" }, files)).toBe("")
  })
})

describe("AreaBacklinkNotes", () => {
  const area = { slug: "networking", frontmatter: { title: "Networking", tags: ["area"] } }
  const files = [
    area,
    { slug: "by-area", frontmatter: { title: "By area", area: "[[Networking]]" } },
    { slug: "by-link", frontmatter: { title: "By link" }, links: ["networking"] },
    { slug: "hidden", unlisted: true, frontmatter: { title: "Hidden", area: "Networking" } },
  ]

  it("lists visible area and ordinary backlinks using flat hrefs", () => {
    const html = renderComponent(AreaBacklinkNotes, area, files)
    expect(html).toContain('href="/by-area"')
    expect(html).toContain('href="/by-link"')
    expect(html).not.toContain("Hidden")
  })

  it("renders only for an area note", () => {
    expect(
      renderComponent(AreaBacklinkNotes, { slug: "plain", frontmatter: { tags: [] } }, files),
    ).toBe("")
  })
})
