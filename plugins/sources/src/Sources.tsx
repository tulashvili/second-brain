import type {
  FullSlug,
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { parseSource } from "./parseSource"
import styles from "./sources.scss"

export const Sources: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    const frontmatter = fileData.frontmatter as Record<string, unknown> | undefined
    const slug = String(fileData.slug ?? "")
    if (
      ["", "index", "about", "projects"].includes(slug) ||
      typeof frontmatter?.flatTag === "string"
    ) {
      return null
    }

    const rawSource = frontmatter?.source
    const values = (Array.isArray(rawSource) ? rawSource : rawSource == null ? [] : [rawSource])
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean)
    if (values.length === 0) return null

    const knownSlugs = new Set(allFiles.map((file) => String(file.slug ?? "")))
    const sources = values.map((value) => {
      const source = parseSource(value, slug as FullSlug)
      return source.internalSlug && !knownSlugs.has(source.internalSlug)
        ? { ...source, href: undefined }
        : source
    })
    return (
      <section class="sources" aria-labelledby="sources-title">
        <h3 id="sources-title">{sources.length > 1 ? "Источники" : "Источник"}</h3>
        <ul>
          {sources.map((source) => (
            <li>
              {source.href ? (
                <a
                  class={source.external ? undefined : "internal"}
                  href={source.href}
                  target={source.external ? "_blank" : undefined}
                  rel={source.external ? "noopener noreferrer" : undefined}
                >
                  {source.label}
                </a>
              ) : (
                <span>{source.label}</span>
              )}
            </li>
          ))}
        </ul>
      </section>
    )
  }
  Component.css = styles
  return Component
}
