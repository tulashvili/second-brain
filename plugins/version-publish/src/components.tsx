import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { h } from "preact"

export const VersionLabel: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const version = fileData.frontmatter?.version
    if (typeof version !== "string" && typeof version !== "number") return null
    return h("p", { class: "note-version" }, `Версия заметки: ${String(version)}`)
  }
  Component.css = `.note-version{color:var(--gray);font-size:0.85rem;margin:0.15rem 0 1rem}`
  return Component
}
