import { describe, expect, it } from "vitest"
import { PlantUmlTransformer } from "./index"

type Node = {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: Node[]
}

const transform = (tree: Node) => {
  const attachment = PlantUmlTransformer().htmlPlugins?.({} as never)?.[0]
  expect(attachment).toBeTypeOf("function")
  const transformer = (attachment as () => (root: Node) => void)()
  transformer(tree)
}

describe("PlantUmlTransformer", () => {
  it("recognizes PlantUML after syntax highlighting", () => {
    const tree: Node = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "figure",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "figcaption",
              properties: {},
              children: [{ type: "text", value: "Sequence overview" }],
            },
            {
              type: "element",
              tagName: "pre",
              properties: { dataLanguage: "plantuml" },
              children: [
                {
                  type: "element",
                  tagName: "code",
                  properties: { dataLanguage: "plantuml" },
                  children: [{ type: "text", value: "@startuml\nA -> B\n@enduml" }],
                },
              ],
            },
          ],
        },
      ],
    }

    transform(tree)

    expect(tree.children?.[0].tagName).toBe("div")
    expect(tree.children?.[0].properties?.className).toEqual(["plantuml-diagram"])
    expect(tree.children?.[0].children?.[1].children?.[0].children?.[0].value).toBe(
      "@startuml\nA -> B\n@enduml",
    )
  })

  it("leaves other fenced code blocks unchanged", () => {
    const code: Node = {
      type: "element",
      tagName: "figure",
      properties: {},
      children: [
        {
          type: "element",
          tagName: "code",
          properties: { className: ["language-bash"] },
          children: [{ type: "text", value: "echo ok" }],
        },
      ],
    }
    const tree: Node = { type: "root", children: [code] }

    transform(tree)

    expect(tree.children?.[0]).toBe(code)
  })

  it("registers only local browser resources", () => {
    const resources = PlantUmlTransformer().externalResources?.({} as never)
    const serialized = JSON.stringify(resources)
    const script =
      resources?.js?.find((resource) => resource.contentType === "inline")?.script ?? ""

    expect(serialized).toContain("/static/plantuml/")
    expect(script).toContain("PLANTUML_STDLIB_BASE")
    expect(script).toContain('dataset.persist = "true"')
    expect(script).toContain("plantUmlState.viz = null")
    expect(script).toContain("plantuml-render-host")
    expect(script).toContain("cloneNode(true)")
    expect(script).toContain("plantUmlState.disabled = true")
    expect(script).toContain("isConnected")
    expect(script).toContain("themechange")
    expect(serialized).not.toMatch(/plantuml\.com|plantuml\.server|kroki\.io/)
  })
})
