import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { toAsciiSlug } from "@security-maybeso/ascii-slug"
import styles from "./semantic-navigation.scss"

type PageData = Record<string, unknown> & {
  slug?: string
  links?: string[]
  frontmatter?: Record<string, unknown>
}

const values = (value: unknown): string[] =>
  (Array.isArray(value) ? value : value == null ? [] : [value]).map(String)

const normalizedReference = (value: string): string => {
  const wikiTarget = value.match(/^\[\[([^\]|]+)(?:\|[^\]]+)?\]\]$/)?.[1] ?? value
  return toAsciiSlug(wikiTarget)
}

export const AreaBacklinkNotes: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    const current = fileData as PageData
    const tags = values(current.frontmatter?.tags).map((tag) => tag.replace(/^#/, "").toLowerCase())
    if (!current.slug || !tags.includes("area")) return null

    const title = String(current.frontmatter?.title ?? current.slug)
    const targets = new Set([normalizedReference(current.slug), normalizedReference(title)])
    const notes = (allFiles as PageData[])
      .filter((file) => {
        if (!file.slug || file.slug === current.slug || file.unlisted === true) return false
        if (file.frontmatter?.hidden === true || file.frontmatter?.hidden === "true") return false
        const fileTags = values(file.frontmatter?.tags).map((tag) =>
          tag.replace(/^#/, "").toLowerCase(),
        )
        if (fileTags.includes("area")) return false
        const backlinks = file.links ?? []
        const areas = values(file.frontmatter?.area)
        return (
          backlinks.some((link) => targets.has(normalizedReference(link))) ||
          areas.some((area) => targets.has(normalizedReference(area)))
        )
      })
      .sort((left, right) =>
        String(left.frontmatter?.title ?? left.slug).localeCompare(
          String(right.frontmatter?.title ?? right.slug),
        ),
      )

    return (
      <section class="area-backlink-notes" aria-labelledby="area-notes-title">
        <h3 id="area-notes-title">Заметки по теме</h3>
        <ul>
          {notes.map((note) => (
            <li>
              <a class="internal" href={`/${note.slug}`}>
                {String(note.frontmatter?.title ?? note.slug)}
              </a>
            </li>
          ))}
        </ul>
      </section>
    )
  }
  Component.css = styles
  return Component
}
