import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { buildSemanticTree, type SemanticFile, type SemanticNode } from "./tree"
import styles from "./semantic-navigation.scss"

export const SemanticGraph: QuartzComponentConstructor = () => {
  const renderNode = (node: SemanticNode) => (
    <li>
      <a class="internal" href={`/${node.slug}`}>
        {node.title}
      </a>
      {node.cycle ? <span class="semantic-cycle"> (cycle)</span> : null}
      {node.children.length > 0 ? <ul>{node.children.map(renderNode)}</ul> : null}
    </li>
  )

  const Component: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    if (!["", "index", "/"].includes(String(fileData.slug ?? ""))) return null
    const visible = (allFiles as Array<Record<string, unknown>>).filter((file) => {
      const frontmatter = file.frontmatter as Record<string, unknown> | undefined
      return (
        file.unlisted !== true && frontmatter?.hidden !== true && frontmatter?.hidden !== "true"
      )
    })
    const referenced = new Set(
      visible.flatMap((file) => [
        ...((file.semanticDownLinks as string[] | undefined) ?? []),
        ...((file.semanticUpLinks as string[] | undefined) ?? []),
      ]),
    )
    const semanticFiles = visible
      .filter((file) => {
        const slug = String(file.slug ?? "")
        return (
          ((file.semanticDownLinks as string[] | undefined)?.length ?? 0) > 0 ||
          ((file.semanticUpLinks as string[] | undefined)?.length ?? 0) > 0 ||
          referenced.has(slug)
        )
      })
      .map((file) => ({
        slug: String(file.slug),
        frontmatter: file.frontmatter as SemanticFile["frontmatter"],
        semanticDownLinks: file.semanticDownLinks as string[] | undefined,
        semanticUpLinks: file.semanticUpLinks as string[] | undefined,
      }))
    if (semanticFiles.length === 0) return null

    const tree = buildSemanticTree(semanticFiles)
    return (
      <section class="semantic-graph" aria-labelledby="semantic-graph-title">
        <h2 id="semantic-graph-title">Структура знаний</h2>
        <ul class="semantic-tree">{tree.roots.map(renderNode)}</ul>
      </section>
    )
  }
  Component.css = styles
  return Component
}
