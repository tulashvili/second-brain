import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { RecentNotes } from "@quartz-community/recent-notes"

const config = await loadQuartzConfig()
export default config

export const isPublishedArticle = (file: QuartzPluginData): boolean => {
  const data = file as QuartzPluginData & Record<string, unknown>
  const frontmatter = data.frontmatter as Record<string, unknown> | undefined
  const slug = String(data.slug ?? "")
  return (
    slug.length > 0 &&
    !["index", "about", "projects", "404"].includes(slug) &&
    typeof frontmatter?.flatTag !== "string" &&
    data.unlisted !== true &&
    frontmatter?.hidden !== true &&
    frontmatter?.hidden !== "true"
  )
}

const RecentArticles = RecentNotes({
  title: "Обновления заметок",
  limit: 10,
  linkToMore: false,
  showTags: false,
  hideTagPages: true,
  hideFolderPages: true,
  filter: isPublishedArticle,
})

const RootRecentArticles: QuartzComponent = (props: QuartzComponentProps) =>
  ["", "index", "/"].includes(String(props.fileData.slug ?? "")) ? RecentArticles(props) : null
RootRecentArticles.css = RecentArticles.css
RootRecentArticles.beforeDOMLoaded = RecentArticles.beforeDOMLoaded
RootRecentArticles.afterDOMLoaded = RecentArticles.afterDOMLoaded

const loadedLayout = await loadQuartzLayout()
const contentLayout = loadedLayout.byPageType.content ?? {}
loadedLayout.byPageType.content = {
  ...contentLayout,
  afterBody: [
    RootRecentArticles,
    ...(contentLayout.afterBody ?? loadedLayout.defaults.afterBody ?? []),
  ],
}
export const layout = loadedLayout
