import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { buildSemanticTree, type SemanticFile, type SemanticNode } from "./tree"
import { isVisibleContentPage, type KnowledgeFile } from "./model"
import styles from "./semantic-navigation.scss"

export const SemanticGraph: QuartzComponentConstructor = () => {
  const renderNode = (node: SemanticNode) => (
    <li>
      <a class="internal" href={node.slug === "index" ? "/" : `/${node.slug}`}>
        {node.title}
      </a>
      {node.cycle ? <span class="semantic-cycle"> (cycle)</span> : null}
      {node.children.length > 0 ? <ul>{node.children.map(renderNode)}</ul> : null}
    </li>
  )

  const Component: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    if (String(fileData.slug ?? "") !== "index") return null
    const visible = (allFiles as KnowledgeFile[]).filter(isVisibleContentPage)
    const semanticFiles = visible
      .filter((file) => {
        const slug = String(file.slug ?? "")
        return slug === "index" || ((file.semanticUpLinks as string[] | undefined)?.length ?? 0) > 0
      })
      .map((file) => ({
        slug: String(file.slug),
        frontmatter: file.frontmatter as SemanticFile["frontmatter"],
        semanticDownLinks: file.semanticDownLinks as string[] | undefined,
        semanticUpLinks: file.semanticUpLinks as string[] | undefined,
      }))
    if (semanticFiles.length === 0) return null

    const tree = buildSemanticTree(semanticFiles)
    const root = tree.roots.find((node) => node.slug === "index")
    if (!root) return null
    return (
      <section class="semantic-graph" aria-labelledby="semantic-graph-title">
        <h2 id="semantic-graph-title">Структура знаний</h2>
        <ul class="semantic-tree">{renderNode(root)}</ul>
      </section>
    )
  }
  Component.css = styles
  return Component
}
