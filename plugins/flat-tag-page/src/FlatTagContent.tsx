import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { canonicalTagSlug } from "./routes"

type PageData = Record<string, unknown> & {
  slug?: string
  unlisted?: boolean
  frontmatter?: Record<string, unknown>
}

const values = (value: unknown): string[] =>
  (Array.isArray(value) ? value : value == null ? [] : [value]).map(String)

export const FlatTagContent: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ fileData, allFiles, cfg }: QuartzComponentProps) => {
    const tag = (fileData as PageData).frontmatter?.flatTag
    if (typeof tag !== "string") {
      throw new Error(
        `FlatTagContent tried to render a non-tag page: ${(fileData as PageData).slug}`,
      )
    }

    const isArea = (fileData as PageData).frontmatter?.flatArea === true
    const pages = (allFiles as PageData[])
      .filter(
        (file) =>
          file.unlisted !== true &&
          file.frontmatter?.hidden !== true &&
          file.frontmatter?.hidden !== "true" &&
          file.frontmatter?.flatTag == null,
      )
      .filter((file) =>
        [...values(file.frontmatter?.tags), ...(isArea ? values(file.frontmatter?.area) : [])].some(
          (candidate) => canonicalTagSlug(candidate.replace(/^\[\[|\]\]$/g, "")) === tag,
        ),
      )
      .sort((left, right) => {
        const leftTitle = String(left.frontmatter?.title ?? left.slug ?? "")
        const rightTitle = String(right.frontmatter?.title ?? right.slug ?? "")
        return leftTitle.localeCompare(rightTitle)
      })

    return (
      <div class="popover-hint flat-tag-content">
        <p>
          {cfg.locale === "en-US"
            ? isArea
              ? "Notes in this area"
              : `Notes tagged #${tag}`
            : isArea
              ? "Заметки в области"
              : `Заметки с тегом #${tag}`}
          : {pages.length}
        </p>
        <ul class="section-ul">
          {pages.map((page) => (
            <li class="section-li">
              <a class="internal" href={`${cfg.locale === "en-US" ? "/en" : ""}/${page.slug}`}>
                {String(page.frontmatter?.title ?? page.slug)}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  return Component
}
