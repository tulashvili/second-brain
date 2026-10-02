export type SemanticFile = {
  slug: string
  frontmatter?: { title?: string }
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
  const bySlug = new Map(files.map((file) => [file.slug, file]))
  const children = new Map<string, Set<string>>()
  const inDegree = new Map<string, number>()
  for (const slug of bySlug.keys()) {
    children.set(slug, new Set())
    inDegree.set(slug, 0)
  }

  const addEdge = (parent: string, child: string) => {
    if (!bySlug.has(parent) || !bySlug.has(child)) return
    const adjacent = children.get(parent)!
    if (adjacent.has(child)) return
    adjacent.add(child)
    inDegree.set(child, (inDegree.get(child) ?? 0) + 1)
  }

  for (const file of files) {
    for (const child of file.semanticDownLinks ?? []) addEdge(file.slug, child)
    for (const parent of file.semanticUpLinks ?? []) addEdge(parent, file.slug)
  }

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
