import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import type { ComponentChildren } from "preact"
import { SemanticGraph } from "./SemanticGraph"
import { AreaBacklinkNotes } from "./AreaBacklinkNotes"
import styles from "./semantic-navigation.scss"

export { SemanticGraph, AreaBacklinkNotes }

export const SemanticNavigation: QuartzComponentConstructor = () => {
  const Graph = SemanticGraph()
  const AreaNotes = AreaBacklinkNotes()
  const Component: QuartzComponent = (props: QuartzComponentProps) => (
    <>
      {Graph(props) as ComponentChildren}
      {AreaNotes(props) as ComponentChildren}
    </>
  )
  Component.css = styles
  return Component
}
