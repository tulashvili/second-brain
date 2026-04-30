import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { Date, getDate } from "./Date"
import { resolveRelative, simplifySlug } from "../util/path"
import { byDateAndAlphabetical } from "./PageList"

const normalizeSlugRef = (input: string) => simplifySlug(input).replace(/^\/+/, "")
const normalizeText = (input: string) =>
  input
    .toLowerCase()
    .replace(/\[\[|\]\]/g, "")
    .replace(/^brain\//, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const linkPointsToArea = (rawLink: string, areaTarget: string) => {
  const normalizedLink = normalizeSlugRef(rawLink)
  const normalizedArea = normalizeSlugRef(areaTarget)
  const areaWithoutBrainPrefix = normalizedArea.replace(/^brain\//, "")
  return normalizedLink === normalizedArea || normalizedLink === areaWithoutBrainPrefix
}

const frontmatterAreaPointsToArea = (frontmatterArea: unknown, areaTitle: string, areaSlug: string) => {
  const values = Array.isArray(frontmatterArea)
    ? frontmatterArea
    : typeof frontmatterArea === "string"
      ? [frontmatterArea]
      : []
  if (values.length === 0) return false

  const titleNeedle = normalizeText(areaTitle)
  const slugNeedle = normalizeText(areaSlug.replace(/^brain\//, ""))

  return values.some((value) => {
    if (typeof value !== "string") return false
    const normalized = normalizeText(value)
    return (
      normalized === titleNeedle ||
      normalized.includes(titleNeedle) ||
      normalized === slugNeedle ||
      normalized.includes(slugNeedle)
    )
  })
}

const AreaBacklinkNotes: QuartzComponent = ({ allFiles, fileData, cfg }: QuartzComponentProps) => {
  const slug = fileData.slug
  const tags = fileData.frontmatter?.tags ?? []
  const isArea = tags.some((tag) => tag.toLowerCase() === "area")

  if (!slug || !slug.startsWith("brain/") || !isArea) {
    return null
  }

  const target = simplifySlug(slug)
  const areaTitle = fileData.frontmatter?.title ?? slug
  const notes = allFiles
    .filter((f) => {
      const hidden = f.frontmatter?.hidden === true || f.frontmatter?.hidden === "true"
      if (hidden || !f.slug?.startsWith("brain/") || f.slug === slug) return false
      const fileTags = f.frontmatter?.tags ?? []
      if (fileTags.some((tag) => tag.toLowerCase() === "area")) return false
      const hasWikiLinkBacklink = Boolean(f.links?.some((link) => linkPointsToArea(link, target)))
      const hasFrontmatterAreaBacklink = frontmatterAreaPointsToArea(
        (f.frontmatter as Record<string, unknown> | undefined)?.area,
        areaTitle,
        slug,
      )
      return hasWikiLinkBacklink || hasFrontmatterAreaBacklink
    })
    .sort(byDateAndAlphabetical(cfg))

  return (
    <section class="area-backlink-notes">
      <h3>Заметки по теме</h3>
      <ul>
        {notes.length === 0 ? (
          <li>
            <span class="meta">Пока нет заметок с обратной ссылкой на эту тему.</span>
          </li>
        ) : (
          notes.map((note) => (
            <li>
              {note.dates && (
                <time class="meta">
                  <Date date={getDate(cfg, note)!} locale={cfg.locale} />
                </time>
              )}
              <a href={resolveRelative(slug, note.slug!)} class="internal">
                {note.frontmatter?.title ?? note.slug}
              </a>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}

export default (() => AreaBacklinkNotes) satisfies QuartzComponentConstructor
