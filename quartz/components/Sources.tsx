import { FilePath, isAbsoluteURL, resolveRelative, slugifyFilePath } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import styles from "./styles/sources.scss"

const Sources: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const rawSource = fileData.frontmatter?.source

  if (!rawSource) return null

  const sources = (Array.isArray(rawSource) ? rawSource : [rawSource]).filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  )
  if (sources.length === 0) return null

  const parseWikiLink = (value: string) => {
    const match = value.match(/^\[\[([^\]]+)\]\]$/)
    if (!match) return null

    const [targetRaw, aliasRaw] = match[1].split("|").map((part) => part.trim())
    if (!targetRaw) return null

    const label = aliasRaw || targetRaw
    const targetPath = `${targetRaw}.md` as FilePath
    const targetSlug = slugifyFilePath(targetPath)
    const href = resolveRelative(fileData.slug!, targetSlug)

    return { label, href, external: false }
  }

  return (
    <div class="sources">
      <h3>{sources.length > 1 ? "Источники" : "Источник"}</h3>
      <ul>
        {sources.map((source) => {
          const wikiLink = parseWikiLink(source)
          if (wikiLink) {
            return (
              <li>
                <a href={wikiLink.href} class="internal">
                  {wikiLink.label}
                </a>
              </li>
            )
          }

          const external = isAbsoluteURL(source)
          return (
            <li>
              {external ? (
                <a href={source} target="_blank" rel="noopener noreferrer">
                  {source}
                </a>
              ) : (
                <span>{source}</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

Sources.css = styles

export default (() => Sources) satisfies QuartzComponentConstructor
