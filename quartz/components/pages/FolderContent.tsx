import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

import style from "../styles/listPage.scss"
import { PageList, SortFn, byDateAndAlphabetical } from "../PageList"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"
import { QuartzPluginData } from "../../plugins/vfile"
import { ComponentChildren } from "preact"
import { concatenateResources } from "../../util/resources"
import { trieFromAllFiles } from "../../util/ctx"
import { resolveRelative, simplifySlug } from "../../util/path"

interface FolderContentOptions {
  showFolderCount: boolean
  showSubfolders: boolean
  sort?: SortFn
}

const defaultOptions: FolderContentOptions = {
  showFolderCount: true,
  showSubfolders: true,
}

const normalizeTag = (value: unknown) => String(value ?? "").toLowerCase().replace(/^#/, "").trim()
const isAreaPageByFrontmatter = (frontmatter: QuartzPluginData["frontmatter"] | undefined) => {
  const rawTags = frontmatter?.tags
  const tags = Array.isArray(rawTags) ? rawTags : typeof rawTags === "string" ? [rawTags] : []
  const hasAreaTag = tags.some((tag) => normalizeTag(tag) === "area")
  const rawArea = (frontmatter as Record<string, unknown> | undefined)?.area
  const areaValues = Array.isArray(rawArea) ? rawArea : typeof rawArea === "string" ? [rawArea] : []
  const hasAreaField = areaValues.some((value) => normalizeTag(value) === "area")
  return hasAreaTag || hasAreaField
}

const normalizeSlugRef = (input: string) => simplifySlug(input).replace(/^\/+/, "")
const normalizeText = (input: string) =>
  input
    .toLowerCase()
    .replace(/\[\[|\]\]/g, "")
    .replace(/^brain\//, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const linkPointsToArea = (rawLink: string, areaTarget: string) => {
  const normalizedLink = normalizeSlugRef(rawLink)
  const normalizedArea = normalizeSlugRef(areaTarget)
  const areaWithoutBrainPrefix = normalizedArea.replace(/^brain\//, "")
  return normalizedLink === normalizedArea || normalizedLink === areaWithoutBrainPrefix
}

export default ((opts?: Partial<FolderContentOptions>) => {
  const options: FolderContentOptions = { ...defaultOptions, ...opts }

  const FolderContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles, cfg } = props

    const trie = (props.ctx.trie ??= trieFromAllFiles(allFiles))
    const folder = trie.findNode(fileData.slug!.split("/"))
    if (!folder) {
      return null
    }

    const allPagesInFolder: QuartzPluginData[] =
      folder.children
        .map((node) => {
          if (node.data) {
            return node.data
          }

          if (node.isFolder && options.showSubfolders) {
            const getMostRecentDates = (): QuartzPluginData["dates"] => {
              let maybeDates: QuartzPluginData["dates"] | undefined = undefined
              for (const child of node.children) {
                if (child.data?.dates) {
                  if (!maybeDates) {
                    maybeDates = { ...child.data.dates }
                  } else {
                    if (child.data.dates.created > maybeDates.created) {
                      maybeDates.created = child.data.dates.created
                    }

                    if (child.data.dates.modified > maybeDates.modified) {
                      maybeDates.modified = child.data.dates.modified
                    }

                    if (child.data.dates.published > maybeDates.published) {
                      maybeDates.published = child.data.dates.published
                    }
                  }
                }
              }
              return (
                maybeDates ?? {
                  created: new Date(),
                  modified: new Date(),
                  published: new Date(),
                }
              )
            }

            return {
              slug: node.slug,
              dates: getMostRecentDates(),
              frontmatter: {
                title: node.displayName,
                tags: [],
              },
            }
          }
        })
        .filter((page) => page !== undefined) ?? []

    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")

    const content = (
      (tree as Root).children.length === 0
        ? fileData.description
        : htmlToJsx(fileData.filePath!, tree)
    ) as ComponentChildren

    const isBrainFolder = fileData.slug === "brain"

    if (isBrainFolder) {
      const areaPages = allFiles
        .filter((f) => {
          return f.slug?.startsWith("brain/") && isAreaPageByFrontmatter(f.frontmatter)
        })
        .sort(byDateAndAlphabetical(cfg))

      return (
        <div class="popover-hint">
          <article class={classes}>{content}</article>
          <div class="brain-grid-auto">
            {areaPages.map((area) => {
              return (
                <a
                  class="brain-card internal"
                  href={resolveRelative(simplifySlug(fileData.slug!), area.slug!)}
                >
                  <h3>{area.frontmatter?.title ?? area.slug}</h3>
                </a>
              )
            })}
          </div>
        </div>
      )
    }

    const listProps = {
      ...props,
      sort: options.sort,
      allFiles: allPagesInFolder,
    }

    return (
      <div class="popover-hint">
        <article class={classes}>{content}</article>
        <div class="page-listing">
          {options.showFolderCount && (
            <p>
              {i18n(cfg.locale).pages.folderContent.itemsUnderFolder({
                count: allPagesInFolder.length,
              })}
            </p>
          )}
          <div>
            <PageList {...listProps} />
          </div>
        </div>
      </div>
    )
  }

  FolderContent.css = concatenateResources(style, PageList.css)
  return FolderContent
}) satisfies QuartzComponentConstructor
