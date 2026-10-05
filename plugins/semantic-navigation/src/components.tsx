import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import type { ComponentChildren } from "preact"
import { SemanticGraph } from "./SemanticGraph"
import { MocChildren } from "./MocChildren"
import { SemanticParents } from "./SemanticParents"
import styles from "./semantic-navigation.scss"

export { SemanticGraph, MocChildren, SemanticParents }

export const SemanticNavigation: QuartzComponentConstructor = () => {
  const Graph = SemanticGraph()
  const Parents = SemanticParents()
  const Children = MocChildren()
  const Component: QuartzComponent = (props: QuartzComponentProps) => (
    <>
      {Parents(props) as ComponentChildren}
      {Children(props) as ComponentChildren}
      {Graph(props) as ComponentChildren}
    </>
  )
  Component.css = styles
  return Component
}
