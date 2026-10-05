import type { FullSlug } from "@quartz-community/types"
import { resolveRelative } from "@quartz-community/utils/path"
import { toAsciiSlug } from "@security-maybeso/ascii-slug"

export type ParsedSource = {
  label: string
  href?: string
  internalSlug?: string
  external: boolean
}

export const parseSource = (value: string, from: FullSlug): ParsedSource => {
  const source = value.trim()
  const wikiLink = source.match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/)
  if (wikiLink) {
    const target = wikiLink[1].trim()
    const label = wikiLink[2]?.trim() || target
    const slug = toAsciiSlug(target) as FullSlug
    return { label, href: resolveRelative(from, slug), internalSlug: slug, external: false }
  }

  try {
    const url = new URL(source)
    if (url.protocol === "http:" || url.protocol === "https:") {
      return { label: source, href: source, external: true }
    }
  } catch {
    // Plain source labels are intentionally rendered without a link.
  }

  return { label: source, external: false }
}
