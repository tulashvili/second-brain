import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { isMocPage, type KnowledgeFile } from "./model"
import styles from "./semantic-navigation.scss"

const hrefFor = (slug: string): string => (slug === "index" ? "/" : `/${slug}`)

export const SemanticParents: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    const current = fileData as KnowledgeFile
    if (current.slug === "index") return null

    const bySlug = new Map(
      (allFiles as KnowledgeFile[])
        .filter((file) => file.slug && isMocPage(file))
        .map((file) => [String(file.slug), file]),
    )
    const parents = [...new Set(current.semanticUpLinks ?? [])]
      .map((slug) => bySlug.get(slug))
      .filter((file): file is KnowledgeFile => file !== undefined)
      .sort((left, right) =>
        String(left.frontmatter?.title ?? left.slug).localeCompare(
          String(right.frontmatter?.title ?? right.slug),
        ),
      )
    if (parents.length === 0) return null

    return (
      <nav class="semantic-parents" aria-label="Родительские разделы">
        <span class="semantic-parents-label">Раздел:</span>
        <ul>
          {parents.map((parent) => (
            <li>
              <a class="internal" href={hrefFor(String(parent.slug))}>
                {String(parent.frontmatter?.title ?? parent.slug)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    )
  }
  Component.css = styles
  return Component
}
