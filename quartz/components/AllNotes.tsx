import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types"
import { PageList, byDateAndAlphabetical } from "./PageList"

const AllNotes: QuartzComponent = (props: QuartzComponentProps) => {
  const filteredFiles = props.allFiles.filter((f) => {
    const hidden =
      f.frontmatter?.hidden === true ||
      f.frontmatter?.hidden === "true"

    if (hidden) return false

    if (f.slug === "index") return false
    if (f.slug === "notes") return false

    return true
  })

  return (
    <PageList
      ctx={props.ctx}
      externalResources={props.externalResources}
      fileData={props.fileData}
      cfg={props.cfg}
      children={props.children}
      tree={props.tree}
      allFiles={filteredFiles} // 🔥 ключ
      files={filteredFiles}
      sort={byDateAndAlphabetical(props.cfg)}
    />
  )
}

export default (() => AllNotes) satisfies QuartzComponentConstructor