import { describe, expect, it } from "vitest"
import { buildSemanticTree, type SemanticFile } from "./tree"

const file = (slug: string, data: Partial<SemanticFile> = {}): SemanticFile => ({
  slug,
  frontmatter: { title: slug.toUpperCase() },
  ...data,
})

describe("buildSemanticTree", () => {
  it("derives child links only by reversing up links", () => {
    const tree = buildSemanticTree([
      file("root", { semanticDownLinks: ["child-b"] }),
      file("child-a", { semanticUpLinks: ["root"] }),
      file("child-b"),
    ])
    expect(tree.roots.map((node) => node.slug)).toEqual(["child-b", "root"])
    expect(tree.roots[1].children.map((node) => node.slug)).toEqual(["child-a"])
  })

  it("keeps disconnected trees in deterministic order", () => {
    const tree = buildSemanticTree([file("z"), file("a"), file("m")])
    expect(tree.roots.map((node) => node.slug)).toEqual(["a", "m", "z"])
  })

  it("represents a cycle finitely with a marker", () => {
    const tree = buildSemanticTree([
      file("a", { semanticUpLinks: ["b"] }),
      file("b", { semanticUpLinks: ["a"] }),
    ])
    expect(tree.roots).toHaveLength(1)
    expect(tree.roots[0].slug).toBe("a")
    expect(tree.roots[0].children[0].slug).toBe("b")
    expect(tree.roots[0].children[0].children[0]).toMatchObject({ slug: "a", cycle: true })
    expect(tree.roots[0].children[0].children[0].children).toEqual([])
  })
})
