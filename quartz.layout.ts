import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

const landingSlugs = new Set(["index", "brain", "notes", "blog", "about", "projects"])

type LayoutPage = { fileData: { slug?: string } }

const isLandingPage = (page: LayoutPage) => {
  const slug = page.fileData.slug ?? ""
  return landingSlugs.has(slug)
}

const hasAreaTag = (page: any) =>
  Boolean(page.fileData.frontmatter?.tags?.some((tag: string) => tag.toLowerCase() === "area"))

const isBrainNotePage = (page: LayoutPage) => Boolean(page.fileData.slug?.startsWith("brain/"))

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [Component.Navigation()],
  afterBody: [
    Component.ConditionalRender({
      component: Component.RecentNotes({
        title: "Обновления заметок",
        limit: 10,
        showTags: false,
        filter: (f) => Boolean(f.slug?.startsWith("brain/")) && f.frontmatter?.hidden !== true,
      }),
      condition: (page) => page.fileData.slug === "brain",
    }),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/tulashvili",
      Telegram: "https://t.me/omar_tulashvili",
      "Second Brain": "https://bitsnbeing.com/brain",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.AllNotes(),
      condition: (page) => page.fileData.slug === "notes",
    }),
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => !isLandingPage(page),
    }),
    Component.ConditionalRender({
      component: Component.TagList(),
      condition: (page) => !isLandingPage(page),
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => !isLandingPage(page),
    }),
  ],
  left: [],
  right: [
    Component.ConditionalRender({
      component: Component.DesktopOnly(Component.TableOfContents()),
      condition: (page) => isBrainNotePage(page) && !hasAreaTag(page),
    }),
  ],
  afterBody: [
    Component.ConditionalRender({
      component: Component.AllNotes(),
      condition: (page) => page.fileData.slug === "blog",
    }),
    Component.AreaBacklinkNotes(),
    Component.ConditionalRender({
      component: Component.Backlinks(),
      condition: (page) => isBrainNotePage(page) && !hasAreaTag(page),
    }),
  ],
}

// components for pages that display lists of pages (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => page.fileData.slug !== "brain",
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => page.fileData.slug !== "brain",
    }),
  ],
  left: [],
  right: [],
}
