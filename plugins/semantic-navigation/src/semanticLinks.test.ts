import type { BuildCtx, FullSlug } from "@quartz-community/types"
import { describe, expect, it } from "vitest"
import { extractSemanticTargets, SemanticLinks } from "./semanticLinks"

describe("extractSemanticTargets", () => {
  it("extracts strings, arrays, aliases, and removes duplicates", () => {
    expect(extractSemanticTargets("[[Parent|Alias]] and [[Child]] and [[Parent]]")).toEqual([
      "Parent",
      "Child",
    ])
    expect(extractSemanticTargets(["[[One]]", "plain", "[[Two|2]]"])).toEqual(["One", "Two"])
    expect(extractSemanticTargets(undefined)).toEqual([])
  })
})

describe("SemanticLinks", () => {
  it("resolves frontmatter and inline up/down into flat existing links", () => {
    const ctx = {
      allSlugs: ["tekuschaya", "roditel", "rebenok"] as FullSlug[],
    } as BuildCtx
    const plugins = SemanticLinks().htmlPlugins?.(ctx) ?? []
    const unifiedPlugin = plugins[0] as () => (
      tree: unknown,
      file: { data: Record<string, unknown>; value: string },
    ) => void
    const transform = unifiedPlugin()
    const file: { data: Record<string, unknown>; value: string } = {
      data: {
        slug: "tekuschaya",
        frontmatter: { up: "[[Родитель|верх]]", down: ["[[Ребенок]]", "[[Missing]]"] },
        links: ["ordinary"],
      },
      value: "down :: [[Ребенок|child]]\nup :: [[Родитель]]",
    }
    transform({}, file)
    expect(file.data.semanticUpLinks).toEqual(["roditel"])
    expect(file.data.semanticDownLinks).toEqual(["rebenok"])
    expect(file.data.links).toEqual(["ordinary", "rebenok", "roditel"])
  })
})
