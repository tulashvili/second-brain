import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { Content } from "../../components"
import { pageResources, renderPage } from "../../components/renderPage"
import { FullPageLayout } from "../../cfg"
import { defaultContentPageLayout, sharedPageComponents } from "../../../quartz.layout"
import { BuildCtx } from "../../util/ctx"
import { pathToRoot } from "../../util/path"
import { StaticResources } from "../../util/resources"
import { QuartzPluginData } from "../vfile"
import { Node } from "unist"
import { write } from "./helpers"

const hasPublishTag = (tags?: string[]) =>
  Boolean(tags?.some((tag) => tag.toLowerCase() === "publish"))

const blogSlugFor = (slug: string) => {
  if (!slug.startsWith("brain/")) return null
  return `blog/${slug.slice("brain/".length)}`
}

async function processPublishBlogPage(
  ctx: BuildCtx,
  tree: Node,
  fileData: QuartzPluginData,
  allFiles: QuartzPluginData[],
  opts: FullPageLayout,
  resources: StaticResources,
) {
  const sourceSlug = fileData.slug!
  const blogSlug = blogSlugFor(sourceSlug)
  if (!blogSlug) return null

  const cfg = ctx.cfg.configuration
  const externalResources = pageResources(pathToRoot(blogSlug), resources)
  const blogFileData: QuartzPluginData = {
    ...fileData,
    slug: blogSlug,
  }

  const componentData: QuartzComponentProps = {
    ctx,
    fileData: blogFileData,
    externalResources,
    cfg,
    children: [],
    tree,
    allFiles,
  }

  const content = renderPage(cfg, blogSlug, componentData, opts, externalResources)
  return write({
    ctx,
    content,
    slug: blogSlug,
    ext: ".html",
  })
}

export const PublishBlogPages: QuartzEmitterPlugin<Partial<FullPageLayout>> = (userOpts) => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultContentPageLayout,
    pageBody: Content(),
    ...userOpts,
  }

  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "PublishBlogPages",
    getQuartzComponents() {
      return [
        Head,
        Header,
        Body,
        ...header,
        ...beforeBody,
        pageBody,
        ...afterBody,
        ...left,
        ...right,
        Footer,
      ]
    },
    async *emit(ctx, content, resources) {
      const allFiles = content.map((c) => c[1].data)

      for (const [tree, file] of content) {
        const slug = file.data.slug!
        const tags = file.data.frontmatter?.tags as string[] | undefined

        if (slug.endsWith("/index") || slug.startsWith("tags/")) continue
        if (!hasPublishTag(tags)) continue

        const blogPage = await processPublishBlogPage(ctx, tree, file.data, allFiles, opts, resources)
        if (blogPage) yield blogPage
      }
    },
    async *partialEmit(ctx, content, resources, changeEvents) {
      const allFiles = content.map((c) => c[1].data)
      const changedSlugs = new Set<string>()

      for (const changeEvent of changeEvents) {
        if (!changeEvent.file) continue
        if (changeEvent.type === "add" || changeEvent.type === "change") {
          changedSlugs.add(changeEvent.file.data.slug!)
        }
      }

      for (const [tree, file] of content) {
        const slug = file.data.slug!
        const tags = file.data.frontmatter?.tags as string[] | undefined

        if (!changedSlugs.has(slug)) continue
        if (slug.endsWith("/index") || slug.startsWith("tags/")) continue
        if (!hasPublishTag(tags)) continue

        const blogPage = await processPublishBlogPage(ctx, tree, file.data, allFiles, opts, resources)
        if (blogPage) yield blogPage
      }
    },
  }
}
