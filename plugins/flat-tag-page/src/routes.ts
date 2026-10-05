import type { FullSlug } from "@quartz-community/types"
import { toAsciiSlug } from "@security-maybeso/ascii-slug"

export type RouteClaim = {
  route: FullSlug
  kind: "article" | "tag" | "reserved"
  source: string
}

export type ArticleRoute = {
  slug: string
  source?: string
}

export const canonicalTagSlug = (tag: string): FullSlug => toAsciiSlug(tag.trim()) as FullSlug

export const collectRouteClaims = (
  files: readonly ArticleRoute[],
  tags: readonly string[],
  reserved: readonly string[],
): RouteClaim[] => [
  ...files.map(({ slug, source }) => ({
    route: toAsciiSlug(slug) as FullSlug,
    kind: "article" as const,
    source: source ?? slug,
  })),
  ...tags.map((tag) => ({
    route: canonicalTagSlug(tag),
    kind: "tag" as const,
    source: `tag:${tag}`,
  })),
  ...reserved.map((route) => ({
    route: canonicalTagSlug(route),
    kind: "reserved" as const,
    source: `reserved:${route}`,
  })),
]

export const validateRouteClaims = (claims: readonly RouteClaim[]): void => {
  const byRoute = new Map<string, RouteClaim[]>()
  for (const claim of claims) {
    const existing = byRoute.get(claim.route) ?? []
    existing.push(claim)
    byRoute.set(claim.route, existing)
  }

  const conflicts = [...byRoute.entries()]
    .filter(([route, routeClaims]) => route.length === 0 || routeClaims.length > 1)
    .sort(([left], [right]) => left.localeCompare(right))

  if (conflicts.length === 0) return

  const diagnostic = conflicts
    .map(([route, routeClaims]) => {
      const sources = routeClaims
        .map(({ source }) => source)
        .sort()
        .join(", ")
      return `${route || "<empty>"}: ${sources}`
    })
    .join("\n")
  throw new Error(`Flat route collisions detected:\n${diagnostic}`)
}
