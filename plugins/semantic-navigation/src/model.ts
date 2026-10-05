export type KnowledgeFrontmatter = Record<string, unknown> & {
  title?: string
  moc?: boolean
  flatTag?: string
  hidden?: boolean | string
}

export type KnowledgeFile = Record<string, unknown> & {
  slug?: string
  unlisted?: boolean
  frontmatter?: KnowledgeFrontmatter
  semanticUpLinks?: string[]
  semanticDownLinks?: string[]
}

export type KnowledgeGraph = {
  files: Map<string, KnowledgeFile>
  parents: Map<string, Set<string>>
  children: Map<string, Set<string>>
}

export type KnowledgeDiagnostic = {
  code:
    | "missing-root"
    | "unparented-article"
    | "unparented-moc"
    | "missing-parent"
    | "parent-not-moc"
    | "self-reference"
    | "cycle"
    | "unreachable-moc"
  slug?: string
  target?: string
  cycle?: string[]
}

const SYSTEM_SLUGS = new Set(["index", "about", "projects", "404"])

const slugOf = (file: KnowledgeFile): string => String(file.slug ?? "").replace(/^\/+|\/+$/g, "")

const isHidden = (file: KnowledgeFile): boolean =>
  file.unlisted === true || file.frontmatter?.hidden === true || file.frontmatter?.hidden === "true"

export const isVisibleContentPage = (file: KnowledgeFile): boolean => {
  const slug = slugOf(file)
  return (
    slug.length > 0 &&
    slug !== "404" &&
    typeof file.frontmatter?.flatTag !== "string" &&
    !isHidden(file)
  )
}

export const isMocPage = (file: KnowledgeFile): boolean =>
  isVisibleContentPage(file) && file.frontmatter?.moc === true

export const isPublishedArticle = (file: KnowledgeFile): boolean =>
  isVisibleContentPage(file) && !SYSTEM_SLUGS.has(slugOf(file)) && !isMocPage(file)

const isKnowledgePage = (file: KnowledgeFile): boolean =>
  isMocPage(file) || isPublishedArticle(file)

const sortedSet = (values: Iterable<string>): Set<string> =>
  new Set([...values].sort((left, right) => left.localeCompare(right)))

export const buildKnowledgeGraph = (input: readonly KnowledgeFile[]): KnowledgeGraph => {
  const files = new Map<string, KnowledgeFile>()
  for (const file of input) {
    const slug = slugOf(file)
    if (slug && isKnowledgePage(file)) files.set(slug, file)
  }

  const parents = new Map<string, Set<string>>()
  const children = new Map<string, Set<string>>()
  for (const slug of files.keys()) {
    parents.set(slug, new Set())
    children.set(slug, new Set())
  }

  for (const [slug, file] of files) {
    for (const parent of file.semanticUpLinks ?? []) {
      const normalized = String(parent).replace(/^\/+|\/+$/g, "")
      if (!normalized || !files.has(normalized)) continue
      parents.get(slug)!.add(normalized)
      children.get(normalized)!.add(slug)
    }
  }

  for (const [slug, values] of parents) parents.set(slug, sortedSet(values))
  for (const [slug, values] of children) children.set(slug, sortedSet(values))
  return { files, parents, children }
}

const cycleDiagnostics = (graph: KnowledgeGraph): KnowledgeDiagnostic[] => {
  const diagnostics: KnowledgeDiagnostic[] = []
  const state = new Map<string, "visiting" | "visited">()
  const path: string[] = []

  const visit = (slug: string): void => {
    if (state.get(slug) === "visited") return
    if (state.get(slug) === "visiting") {
      const start = path.indexOf(slug)
      diagnostics.push({ code: "cycle", cycle: [...path.slice(start), slug] })
      return
    }
    state.set(slug, "visiting")
    path.push(slug)
    for (const child of graph.children.get(slug) ?? []) {
      if (isMocPage(graph.files.get(child)!)) visit(child)
    }
    path.pop()
    state.set(slug, "visited")
  }

  const mocs = [...graph.files.entries()]
    .filter(([, file]) => isMocPage(file))
    .map(([slug]) => slug)
    .sort((left, right) => left.localeCompare(right))
  for (const slug of mocs) visit(slug)
  return diagnostics
}

export const validateKnowledgeGraph = (
  input: readonly KnowledgeFile[],
  rootSlug: string,
): KnowledgeDiagnostic[] => {
  const graph = buildKnowledgeGraph(input)
  const diagnostics: KnowledgeDiagnostic[] = []
  const root = graph.files.get(rootSlug)
  if (!root || !isMocPage(root)) diagnostics.push({ code: "missing-root", slug: rootSlug })

  for (const [slug, file] of graph.files) {
    const declaredParents = sortedSet(
      (file.semanticUpLinks ?? [])
        .map((parent) => String(parent).replace(/^\/+|\/+$/g, ""))
        .filter(Boolean),
    )
    if (isPublishedArticle(file) && declaredParents.size === 0) {
      diagnostics.push({ code: "unparented-article", slug })
    }
    if (isMocPage(file) && slug !== rootSlug && declaredParents.size === 0) {
      diagnostics.push({ code: "unparented-moc", slug })
    }
    for (const target of declaredParents) {
      if (target === slug) {
        diagnostics.push({ code: "self-reference", slug, target })
        continue
      }
      const parent = graph.files.get(target)
      if (!parent) diagnostics.push({ code: "missing-parent", slug, target })
      else if (!isMocPage(parent)) diagnostics.push({ code: "parent-not-moc", slug, target })
    }
  }

  diagnostics.push(...cycleDiagnostics(graph))

  const reachable = new Set<string>()
  const visitReachable = (slug: string): void => {
    if (reachable.has(slug)) return
    reachable.add(slug)
    for (const child of graph.children.get(slug) ?? []) {
      const file = graph.files.get(child)
      if (file && isMocPage(file)) visitReachable(child)
    }
  }
  if (root && isMocPage(root)) visitReachable(rootSlug)
  for (const [slug, file] of graph.files) {
    if (isMocPage(file) && slug !== rootSlug && !reachable.has(slug)) {
      diagnostics.push({ code: "unreachable-moc", slug })
    }
  }

  return diagnostics
}
