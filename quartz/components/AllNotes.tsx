import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { PageList, byDateAndAlphabetical } from "./PageList"

const AllNotes: QuartzComponent = (props: QuartzComponentProps) => {
  const pageSlug = props.fileData.slug ?? ""
  const isBlogPage = pageSlug === "blog"

  const isBrainNote = (slug?: string) => Boolean(slug?.startsWith("brain/"))
  const hasPublishTag = (tags?: string[]) =>
    Boolean(tags?.some((tag) => tag.toLowerCase() === "publish"))

  const filteredFiles = props.allFiles.filter((f) => {
    const hidden = f.frontmatter?.hidden === true || f.frontmatter?.hidden === "true"

    if (hidden) return false

    if (!isBrainNote(f.slug)) return false

    if (isBlogPage && !hasPublishTag(f.frontmatter?.tags)) return false

    return true
  })

  const filesForList = isBlogPage
    ? filteredFiles.map((file) => ({
        ...file,
        dates: file.dates
          ? {
              ...file.dates,
              modified: file.dates.created ?? file.dates.modified,
            }
          : file.dates,
      }))
    : filteredFiles

  return (
    <PageList
      ctx={props.ctx}
      externalResources={props.externalResources}
      fileData={props.fileData}
      cfg={props.cfg}
      children={props.children}
      tree={props.tree}
      allFiles={filesForList}
      files={filesForList}
      sort={byDateAndAlphabetical(props.cfg)}
    />
  )
}

export default (() => AllNotes) satisfies QuartzComponentConstructor
