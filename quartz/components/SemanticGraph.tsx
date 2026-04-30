import { QuartzComponent, QuartzComponentProps } from "./types"
import style from "./styles/semanticGraph.scss"
import { FullSlug, SimpleSlug, resolveRelative } from "../util/path"

type SemanticFile = {
  slug: FullSlug
  frontmatter?: {
    title?: string
  }
  semanticDownLinks?: SimpleSlug[]
  semanticUpLinks?: SimpleSlug[]
}

function toSemanticFile(file: any): SemanticFile | null {
  if (!file?.slug) return null
  return {
    slug: file.slug as FullSlug,
    frontmatter: file.frontmatter,
    semanticDownLinks: file.semanticDownLinks,
    semanticUpLinks: file.semanticUpLinks,
  }
}

function buildTree(files: SemanticFile[]) {
  const bySlug = new Map<SimpleSlug, SemanticFile>()
  const children = new Map<SimpleSlug, Set<SimpleSlug>>()
  const inDegree = new Map<SimpleSlug, number>()

  for (const file of files) {
    const slug = file.slug as unknown as SimpleSlug
    bySlug.set(slug, file)
    if (!children.has(slug)) children.set(slug, new Set())
    if (!inDegree.has(slug)) inDegree.set(slug, 0)
  }

  for (const file of files) {
    const from = file.slug as unknown as SimpleSlug
    for (const to of file.semanticDownLinks ?? []) {
      if (!bySlug.has(to)) continue
      children.get(from)!.add(to)
      inDegree.set(to, (inDegree.get(to) ?? 0) + 1)
    }

    // `up` link on current note means parent -> current.
    for (const parent of file.semanticUpLinks ?? []) {
      if (!bySlug.has(parent)) continue
      children.get(parent)!.add(from)
      inDegree.set(from, (inDegree.get(from) ?? 0) + 1)
    }
  }

  const roots = [...bySlug.keys()].filter((slug) => (inDegree.get(slug) ?? 0) === 0)
  return { bySlug, children, roots }
}

function titleFor(file: SemanticFile | undefined, fallback: string): string {
  return file?.frontmatter?.title || fallback
}

const SemanticGraph: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const allSemanticFiles = allFiles
    .map((f) => toSemanticFile(f))
    .filter((f): f is SemanticFile => Boolean(f))
  const referenced = new Set<SimpleSlug>()
  for (const file of allSemanticFiles) {
    for (const child of file.semanticDownLinks ?? []) referenced.add(child)
    for (const parent of file.semanticUpLinks ?? []) referenced.add(parent)
  }

  const files = allSemanticFiles.filter((file) => {
    const slug = file.slug as unknown as SimpleSlug
    return (
      (file.semanticDownLinks?.length ?? 0) > 0 ||
      (file.semanticUpLinks?.length ?? 0) > 0 ||
      referenced.has(slug)
    )
  })

  const { bySlug, children, roots } = buildTree(files)

  const renderNode = (slug: SimpleSlug, visited: Set<SimpleSlug>) => {
    const file = bySlug.get(slug)
    const childSlugs = [...(children.get(slug) ?? [])].sort((a, b) => a.localeCompare(b))
    const href = resolveRelative(fileData.slug!, slug as unknown as FullSlug)

    if (visited.has(slug)) {
      return (
        <li>
          <a href={href}>{titleFor(file, slug)}</a>
          <span class="semantic-cycle"> (cycle)</span>
        </li>
      )
    }

    const nextVisited = new Set(visited)
    nextVisited.add(slug)

    if (childSlugs.length === 0) {
      return (
        <li>
          <a href={href}>{titleFor(file, slug)}</a>
        </li>
      )
    }

    return (
      <li>
        <details open>
          <summary>
            <a href={href}>{titleFor(file, slug)}</a>
            <span class="semantic-count"> ({childSlugs.length})</span>
          </summary>
          <ul>
            {childSlugs.map((child) => renderNode(child, nextVisited))}
          </ul>
        </details>
      </li>
    )
  }

  const orderedRoots = (roots.length > 0 ? roots : [...bySlug.keys()]).sort((a, b) =>
    a.localeCompare(b),
  )

  return (
    <section class="semantic-graph">
      <p class="semantic-intro">Структура строится по полям `down :: [[...]]` и `down: [[...]]`.</p>
      <ul class="semantic-tree">
        {orderedRoots.map((root) => renderNode(root, new Set()))}
      </ul>
    </section>
  )
}

SemanticGraph.css = style

export default () => SemanticGraph
