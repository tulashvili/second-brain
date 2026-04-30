import { QuartzTransformerPlugin } from "../types"
import {
  FullSlug,
  SimpleSlug,
  TransformOptions,
  RelativeURL,
  simplifySlug,
  splitAnchor,
  stripSlashes,
  transformLink,
} from "../../util/path"

const INLINE_DOWN_RE = /^\s*down\s*::\s*(.+)$/gim
const INLINE_UP_RE = /^\s*up\s*::\s*(.+)$/gim
const WIKILINK_RE = /\[\[([^\]]+)\]\]/g

function extractWikilinkTargets(input: string): string[] {
  const targets: string[] = []
  for (const match of input.matchAll(WIKILINK_RE)) {
    const raw = match[1]?.trim()
    if (!raw) continue

    // support aliases: [[Target|Alias]]
    const [target] = raw.split("|", 1)
    const normalized = target?.trim().replace(/^\[+/, "").replace(/\]+$/, "")
    if (normalized) targets.push(normalized)
  }
  return targets
}

function toSimpleSlug(src: FullSlug, target: string, opts: TransformOptions): SimpleSlug | null {
  const transformed = transformLink(src, target as RelativeURL, opts)
  const url = new URL(transformed, `https://base.com/${stripSlashes(simplifySlug(src as FullSlug), true)}`)

  let [destCanonical] = splitAnchor(url.pathname)
  if (destCanonical.endsWith("/")) {
    destCanonical += "index"
  }

  const full = decodeURIComponent(stripSlashes(destCanonical, true)) as FullSlug
  return simplifySlug(full)
}

export const SemanticDownLinks: QuartzTransformerPlugin = () => {
  return {
    name: "SemanticDownLinks",
    htmlPlugins(ctx) {
      return [
        () => {
          return (_tree, file) => {
            const src = file.data.slug!
            const transformOptions: TransformOptions = {
              strategy: "shortest",
              allSlugs: ctx.allSlugs,
            }

            const downTargets = new Set<string>()
            const upTargets = new Set<string>()

            const downField = file.data.frontmatter?.down
            if (typeof downField === "string") {
              extractWikilinkTargets(downField).forEach((t) => downTargets.add(t))
            } else if (Array.isArray(downField)) {
              downField
                .filter((v): v is string => typeof v === "string")
                .flatMap((v) => extractWikilinkTargets(v))
                .forEach((t) => downTargets.add(t))
            }

            const upField = file.data.frontmatter?.up
            if (typeof upField === "string") {
              extractWikilinkTargets(upField).forEach((t) => upTargets.add(t))
            } else if (Array.isArray(upField)) {
              upField
                .filter((v): v is string => typeof v === "string")
                .flatMap((v) => extractWikilinkTargets(v))
                .forEach((t) => upTargets.add(t))
            }

            const markdown =
              typeof file.value === "string"
                ? file.value
                : Buffer.from(file.value as Uint8Array).toString()
            for (const match of markdown.matchAll(INLINE_DOWN_RE)) {
              const value = match[1]?.trim()
              if (!value) continue
              extractWikilinkTargets(value).forEach((t) => downTargets.add(t))
            }
            for (const match of markdown.matchAll(INLINE_UP_RE)) {
              const value = match[1]?.trim()
              if (!value) continue
              extractWikilinkTargets(value).forEach((t) => upTargets.add(t))
            }

            const semanticDownLinks = [...downTargets]
              .map((target) => toSimpleSlug(src, target, transformOptions))
              .filter((slug): slug is SimpleSlug => slug !== null)

            // `up :: [[Parent]]` means Parent -> current note in the semantic tree.
            for (const upTarget of upTargets) {
              const parent = toSimpleSlug(src, upTarget, transformOptions)
              if (!parent) continue
              file.data.semanticUpLinks = [...new Set([...(file.data.semanticUpLinks ?? []), parent])]
            }

            file.data.semanticDownLinks = semanticDownLinks
            file.data.links = [...new Set([...(file.data.links ?? []), ...semanticDownLinks])]
          }
        },
      ]
    },
  }
}

declare module "vfile" {
  interface DataMap {
    semanticDownLinks?: SimpleSlug[]
    semanticUpLinks?: SimpleSlug[]
  }
}
