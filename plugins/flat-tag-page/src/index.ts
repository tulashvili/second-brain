import type {
  FullSlug,
  PageMatcher,
  QuartzPageTypePluginInstance,
  QuartzTransformerPluginInstance,
} from "@quartz-community/types"
import { FlatTagContent } from "./FlatTagContent"
import { canonicalTagSlug } from "./routes"

export * from "./routes"
export { FlatTagContent } from "./FlatTagContent"
export { FlatTagList } from "./FlatTagList"

export const FlatTagRoutes = (): QuartzTransformerPluginInstance => ({
  name: "FlatTagRoutes",
  markdownPlugins(ctx) {
    return [
      () => (_tree: unknown, file: { data: Record<string, unknown> }) => {
        const frontmatter = file.data.frontmatter as Record<string, unknown> | undefined
        const tag = frontmatter?.flatTag
        if (typeof tag !== "string") return

        const previousSlug = String(file.data.slug ?? "")
        const relativePath = String(file.data.relativePath ?? "")
        if (
          !previousSlug.startsWith("_flat-tags/") &&
          !previousSlug.startsWith("flat-tags/") &&
          !relativePath.startsWith("_flat-tags/")
        )
          return

        const slug = canonicalTagSlug(tag)
        file.data.slug = slug
        const candidates = new Set([previousSlug, `_flat-tags/${tag}`, `flat-tags/${tag}`])
        const index = ctx.allSlugs.findIndex((candidate) => candidates.has(candidate))
        if (index >= 0) ctx.allSlugs[index] = slug
      },
    ]
  },
})

const flatTagMatcher: PageMatcher = ({ fileData }) =>
  typeof (fileData.frontmatter as Record<string, unknown> | undefined)?.flatTag === "string"

export const FlatTagPage = (): QuartzPageTypePluginInstance => ({
  name: "FlatTagPage",
  priority: 20,
  match: flatTagMatcher,
  layout: "tag",
  body: FlatTagContent,
})
