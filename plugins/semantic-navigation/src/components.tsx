import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import type { ComponentChildren } from "preact"
import { RecentNotes } from "@quartz-community/recent-notes"
import { SemanticGraph } from "./SemanticGraph"
import { MocChildren } from "./MocChildren"
import { SemanticParents } from "./SemanticParents"
import { isPublishedArticle } from "./model"
import styles from "./semantic-navigation.scss"

export { SemanticGraph, MocChildren, SemanticParents }

export const SemanticNavigation: QuartzComponentConstructor = () => {
  const Graph = SemanticGraph()
  const Children = MocChildren()
  const RecentArticles = RecentNotes({
    title: "Обновления заметок",
    limit: 10,
    linkToMore: false,
    showTags: false,
    hideTagPages: true,
    hideFolderPages: true,
    filter: isPublishedArticle,
  })
  const Component: QuartzComponent = (props: QuartzComponentProps) => (
    <>
      {Children(props) as ComponentChildren}
      {props.fileData.slug === "index" && (RecentArticles(props) as ComponentChildren)}
      {Graph(props) as ComponentChildren}
    </>
  )
  Component.css = `${styles}\n${RecentArticles.css ?? ""}`
  return Component
}
