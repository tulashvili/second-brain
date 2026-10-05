import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { RecentNotes } from "@quartz-community/recent-notes"
import { isPublishedArticle } from "./plugins/semantic-navigation/src/model"

const config = await loadQuartzConfig()
export default config

export { isPublishedArticle }

const RecentArticles = RecentNotes({
  title: "Обновления заметок",
  limit: 10,
  linkToMore: false,
  showTags: false,
  hideTagPages: true,
  hideFolderPages: true,
  filter: (file: QuartzPluginData) => isPublishedArticle(file),
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
