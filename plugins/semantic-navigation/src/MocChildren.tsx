import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { buildKnowledgeGraph, isMocPage, type KnowledgeFile } from "./model"
import styles from "./semantic-navigation.scss"
import { localizedHref } from "./localizedHref"

export const MocChildren: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ fileData, allFiles, cfg }: QuartzComponentProps) => {
    const current = fileData as KnowledgeFile
    const slug = String(current.slug ?? "")
    if (!slug || !isMocPage(current)) return null

    const graph = buildKnowledgeGraph(allFiles as KnowledgeFile[])
    const children = [...(graph.children.get(slug) ?? [])]
      .map((childSlug) => graph.files.get(childSlug))
      .filter((file): file is KnowledgeFile => file !== undefined)
      .sort((left, right) =>
        String(left.frontmatter?.title ?? left.slug).localeCompare(
          String(right.frontmatter?.title ?? right.slug),
        ),
      )
    if (children.length === 0) return null

    const headingId = `moc-children-${slug}`
    return (
      <section class="moc-children" aria-labelledby={headingId}>
        <h2 id={headingId}>
          {cfg.locale === "en-US" ? "All notes in this section" : "Все заметки раздела"}
        </h2>
        <ul>
          {children.map((child) => (
            <li>
              <a class="internal" href={localizedHref(String(child.slug), cfg.locale)}>
                {String(child.frontmatter?.title ?? child.slug)}
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
