import fs from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"
import type {
  FilePath,
  QuartzEmitterPlugin,
  QuartzTransformerPluginInstance,
} from "@quartz-community/types"
import { plantUmlRuntime } from "./runtime"
import { plantUmlStyles } from "./styles"

type HastNode = {
  type?: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

const textContent = (node: HastNode): string => {
  if (node.type === "text") return node.value ?? ""
  return node.children?.map(textContent).join("") ?? ""
}

const isPlantUmlCode = (node: HastNode): boolean => {
  if (node.tagName !== "code") return false

  const language = node.properties?.dataLanguage ?? node.properties?.["data-language"]
  const classes = node.properties?.className
  return (
    language === "plantuml" ||
    (Array.isArray(classes) && classes.includes("language-plantuml")) ||
    (typeof classes === "string" && classes.split(/\s+/).includes("language-plantuml"))
  )
}

const findPlantUmlCode = (node: HastNode): HastNode | undefined => {
  if (isPlantUmlCode(node)) return node
  for (const child of node.children ?? []) {
    const code = findPlantUmlCode(child)
    if (code) return code
  }
  return undefined
}

const diagramNode = (source: string): HastNode => ({
  type: "element",
  tagName: "div",
  properties: { className: ["plantuml-diagram"] },
  children: [
    {
      type: "element",
      tagName: "div",
      properties: {
        className: ["plantuml-canvas"],
        role: "img",
        ariaLabel: "PlantUML diagram",
      },
      children: [],
    },
    {
      type: "element",
      tagName: "pre",
      properties: { className: ["plantuml-source"] },
      children: [
        {
          type: "element",
          tagName: "code",
          properties: {},
          children: [{ type: "text", value: source }],
        },
      ],
    },
  ],
})

const replacePlantUmlFigures = (node: HastNode): void => {
  if (!node.children) return
  node.children = node.children.map((child) => {
    const code = child.tagName === "figure" ? findPlantUmlCode(child) : undefined
    if (code) return diagramNode(textContent(code))
    replacePlantUmlFigures(child)
    return child
  })
}

export const PlantUmlTransformer = (): QuartzTransformerPluginInstance => ({
  name: "PlantUmlTransformer",
  htmlPlugins() {
    return [() => (tree: HastNode) => replacePlantUmlFigures(tree)]
  },
  externalResources() {
    return {
      css: [{ content: plantUmlStyles, inline: true }],
      js: [
        {
          loadTime: "afterDOMReady",
          contentType: "inline",
          moduleType: "module",
          spaPreserve: true,
          script: plantUmlRuntime,
        },
      ],
    }
  },
})

const plantUmlAssets = [
  "plantuml.js",
  "viz-global.js",
  "themes.js",
  "emoji.js",
  "openiconic.js",
] as const

export const PlantUmlAssets: QuartzEmitterPlugin = () => ({
  name: "PlantUmlAssets",
  async emit(ctx) {
    const require = createRequire(import.meta.url)
    const packageRoot = path.dirname(require.resolve("@plantuml/core/package.json"))
    const targetRoot = path.join(ctx.argv.output, "static", "plantuml")
    await fs.mkdir(targetRoot, { recursive: true })

    return Promise.all(
      plantUmlAssets.map(async (asset) => {
        const target = path.join(targetRoot, asset)
        await fs.copyFile(path.join(packageRoot, asset), target)
        return target as FilePath
      }),
    )
  },
})
