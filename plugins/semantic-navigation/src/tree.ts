import { buildKnowledgeGraph, type KnowledgeFile } from "./model"

export type SemanticFile = KnowledgeFile & {
  slug: string
  frontmatter?: Record<string, unknown> & { title?: string }
  semanticDownLinks?: string[]
  semanticUpLinks?: string[]
}

export type SemanticNode = {
  slug: string
  title: string
  children: SemanticNode[]
  cycle?: true
}

export type SemanticTree = { roots: SemanticNode[] }

export const buildSemanticTree = (files: readonly SemanticFile[]): SemanticTree => {
  const graph = buildKnowledgeGraph(files)
  const bySlug = new Map(
    [...graph.files.entries()].map(([slug, file]) => [slug, file as SemanticFile]),
  )
  const children = graph.children
  const inDegree = new Map<string, number>()
  for (const slug of bySlug.keys()) inDegree.set(slug, graph.parents.get(slug)?.size ?? 0)

  const globallyVisited = new Set<string>()
  const visit = (slug: string, path: ReadonlySet<string>): SemanticNode => {
    const source = bySlug.get(slug)!
    if (path.has(slug)) {
      return { slug, title: source.frontmatter?.title ?? slug, children: [], cycle: true }
    }

    globallyVisited.add(slug)
    const nextPath = new Set(path)
    nextPath.add(slug)
    return {
      slug,
      title: source.frontmatter?.title ?? slug,
      children: [...(children.get(slug) ?? [])]
        .sort((left, right) => left.localeCompare(right))
        .map((child) => visit(child, nextPath)),
    }
  }

  const ordered = [...bySlug.keys()].sort((left, right) => left.localeCompare(right))
  const rootSlugs = ordered.filter((slug) => (inDegree.get(slug) ?? 0) === 0)
  const roots = rootSlugs.map((slug) => visit(slug, new Set()))
  for (const slug of ordered) {
    if (!globallyVisited.has(slug)) roots.push(visit(slug, new Set()))
  }
  return { roots }
}
