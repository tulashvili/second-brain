import type { FullSlug, QuartzTransformerPluginInstance } from "@quartz-community/types"
import { resolveRelative } from "@quartz-community/utils/path"

import { toAsciiSlug } from "./slug"

export { toAsciiSlug, transliterateSegment } from "./slug"

export const AsciiSlug = (): QuartzTransformerPluginInstance => ({
  name: "AsciiSlug",
  markdownPlugins(ctx) {
    return [
      () => (_tree: unknown, file: { data: Record<string, unknown> }) => {
        const rawSlug = String(file.data.slug ?? "")
        if (rawSlug.length === 0) return

        const normalized = toAsciiSlug(rawSlug)
        if (normalized.length > 0) {
          file.data.slug = normalized
          const index = ctx.allSlugs.findIndex((slug) => String(slug) === rawSlug)
          if (index >= 0) ctx.allSlugs[index] = normalized as FullSlug
        }
      },
    ]
  },
  htmlPlugins(ctx) {
    return [
      () => (tree: Record<string, unknown>, file: { data: Record<string, unknown> }) => {
        const existing = new Set(ctx.allSlugs.map(String))

        const visit = (node: Record<string, unknown>): void => {
          if (node.type === "element" && node.tagName === "a") {
            const properties = node.properties as Record<string, unknown> | undefined
            const href = properties?.href
            if (
              properties &&
              typeof href === "string" &&
              href.length > 0 &&
              !href.startsWith("#") &&
              !href.startsWith("//") &&
              !/^[a-z][a-z\d+.-]*:/i.test(href)
            ) {
              const [rawPath, rawAnchor] = href.split("#", 2)
              const decoded = decodeURIComponent(rawPath)
                .replace(/^\.?\//, "")
                .replace(/\.md$/i, "")
              const target = toAsciiSlug(decoded)
              if (target && existing.has(target)) {
                properties.href = `${resolveRelative(
                  String(file.data.slug ?? "index") as FullSlug,
                  target as FullSlug,
                )}${rawAnchor == null ? "" : `#${rawAnchor}`}`
              } else if (
                target &&
                !/\.[a-z\d]{1,8}$/i.test(decoded) &&
                !/^(?:assets|static)\//i.test(decoded)
              ) {
                node.tagName = "span"
                delete properties.href
                delete properties.target
                const current = properties.className
                const classes = Array.isArray(current)
                  ? current.map(String)
                  : typeof current === "string"
                    ? current.split(/\s+/).filter(Boolean)
                    : []
                properties.className = [...new Set([...classes, "broken-link"])]
              }
            }
          }

          const children = node.children
          if (Array.isArray(children)) {
            for (const child of children) {
              if (child && typeof child === "object") visit(child as Record<string, unknown>)
            }
          }
        }

        visit(tree)
      },
    ]
  },
})
