import {
  isMocPage,
  isPublishedArticle,
  type KnowledgeFile,
} from "@security-maybeso/semantic-navigation"
import { getDate } from "@quartz-community/utils"

export type ArticleRssFile = KnowledgeFile & {
  description?: string
  defaultDateType?: string
  dates?: Record<string, Date>
}

export type ArticleRssOptions = {
  baseUrl: string
  pageTitle: string
  limit?: number
}

export type KnowledgeStructureManifest = {
  articleSlugs: string[]
  mocSlugs: string[]
}

const titleOf = (file: ArticleRssFile): string => String(file.frontmatter?.title ?? file.slug ?? "")

const dateOf = (file: ArticleRssFile): Date | undefined => getDate(file as never)

export const selectRssArticles = (files: readonly ArticleRssFile[]): ArticleRssFile[] =>
  files.filter(isPublishedArticle).sort((left, right) => {
    const leftDate = dateOf(left)
    const rightDate = dateOf(right)
    if (leftDate && rightDate) return rightDate.getTime() - leftDate.getTime()
    if (leftDate) return -1
    if (rightDate) return 1
    return titleOf(left).localeCompare(titleOf(right))
  })

const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")

const siteOrigin = (baseUrl: string): string =>
  `https://${baseUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`

export const renderArticleRss = (
  files: readonly ArticleRssFile[],
  options: ArticleRssOptions,
): string => {
  const origin = siteOrigin(options.baseUrl)
  const selected = selectRssArticles(files).slice(0, options.limit ?? files.length)
  const items = selected
    .map((file) => {
      const slug = String(file.slug)
      const url = `${origin}/${encodeURI(slug)}`
      const date = dateOf(file)
      return `<item>
        <title>${escapeXml(titleOf(file))}</title>
        <link>${url}</link>
        <guid>${url}</guid>
        <description>${escapeXml(String(file.description ?? ""))}</description>
        ${date ? `<pubDate>${date.toUTCString()}</pubDate>` : ""}
      </item>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(options.pageTitle)}</title>
    <link>${origin}</link>
    <description>${options.baseUrl.replace(/\/+$/, "").endsWith("/en") ? "Latest notes on" : "Последние заметки на"} ${escapeXml(options.pageTitle)}</description>
    <generator>Quartz -- quartz.jzhao.xyz</generator>
    ${items}
  </channel>
</rss>`
}

export const buildKnowledgeStructureManifest = (
  files: readonly ArticleRssFile[],
): KnowledgeStructureManifest => ({
  articleSlugs: files
    .filter(isPublishedArticle)
    .map((file) => String(file.slug))
    .sort((left, right) => left.localeCompare(right)),
  mocSlugs: files
    .filter(isMocPage)
    .map((file) => String(file.slug))
    .sort((left, right) => left.localeCompare(right)),
})
