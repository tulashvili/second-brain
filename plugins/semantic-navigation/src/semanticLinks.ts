import type { FullSlug, QuartzTransformerPluginInstance } from "@quartz-community/types"
import { toAsciiSlug } from "@security-maybeso/ascii-slug"

export const extractSemanticTargets = (input: unknown): string[] => {
  const values = Array.isArray(input) ? input : typeof input === "string" ? [input] : []
  const targets: string[] = []
  for (const value of values) {
    if (typeof value !== "string") continue
    for (const match of value.matchAll(/\[\[([^\]]+)\]\]/g)) {
      const target = match[1]?.split("|", 1)[0]?.split("#", 1)[0]?.trim()
      if (target && !targets.includes(target)) targets.push(target)
    }
  }
  return targets
}

export const SemanticLinks = (): QuartzTransformerPluginInstance => ({
  name: "SemanticLinks",
  htmlPlugins(ctx) {
    return [
      () => (_tree: unknown, file: { data: Record<string, unknown>; value: unknown }) => {
        const frontmatter = file.data.frontmatter as Record<string, unknown> | undefined
        const markdown =
          typeof file.value === "string"
            ? file.value
            : file.value instanceof Uint8Array
              ? Buffer.from(file.value).toString()
              : ""

        const inlineTargets = (direction: "up" | "down"): string[] => {
          const values = [
            ...markdown.matchAll(new RegExp(`^\\s*${direction}\\s*::\\s*(.+)$`, "gim")),
          ].map((match) => match[1])
          return extractSemanticTargets(values)
        }
        const resolve = (targets: string[]): string[] => [
          ...new Set(
            targets
              .map((target) => toAsciiSlug(target))
              .filter((slug) => ctx.allSlugs.includes(slug as FullSlug)),
          ),
        ]

        const down = resolve([
          ...extractSemanticTargets(frontmatter?.down),
          ...inlineTargets("down"),
        ])
        const up = resolve([...extractSemanticTargets(frontmatter?.up), ...inlineTargets("up")])
        file.data.semanticDownLinks = down
        file.data.semanticUpLinks = up
        file.data.links = [
          ...new Set([...((file.data.links as string[] | undefined) ?? []), ...down, ...up]),
        ]
      },
    ]
  },
})
