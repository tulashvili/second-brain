import { render } from "preact-render-to-string"
import { describe, expect, it } from "vitest"
import type { FullSlug } from "@quartz-community/types"
import { FlatTagContent } from "./FlatTagContent"
import { FlatTagList } from "./FlatTagList"
import { FlatTagPage, FlatTagRoutes } from "./index"

const props = (
  fileData: Record<string, unknown>,
  allFiles: Record<string, unknown>[] = [],
  locale = "ru-RU",
) =>
  ({
    fileData,
    allFiles,
    cfg: { locale },
    children: null,
    tree: {},
    ctx: {},
    externalResources: {},
  }) as never

describe("FlatTagList", () => {
  it("links tags directly at the site root without duplicating Quartz's visual hash", () => {
    const output = FlatTagList()(props({ frontmatter: { tags: ["monitoring"] } }))
    const html = render(output as Parameters<typeof render>[0])
    expect(html).toContain('href="/monitoring"')
    expect(html).toContain(">monitoring</a>")
    expect(html).not.toContain(">#monitoring</a>")
    expect(html).not.toContain("/tags/")
  })
})

it("places English tag links under /en/", () => {
  const html = render(
    FlatTagList()(props({ frontmatter: { tags: ["monitoring"] } }, [], "en-US")) as Parameters<
      typeof render
    >[0],
  )
  expect(html).toContain('href="/en/monitoring"')
  expect(html).toContain('aria-label="Tags"')
})

describe("FlatTagContent", () => {
  it("lists only matching visible articles using flat hrefs", () => {
    const files = [
      { slug: "elastic-stack", frontmatter: { title: "Elastic", tags: ["monitoring"] } },
      { slug: "hidden", unlisted: true, frontmatter: { title: "Hidden", tags: ["monitoring"] } },
      {
        slug: "frontmatter-hidden",
        frontmatter: { title: "Frontmatter hidden", tags: ["monitoring"], hidden: true },
      },
      {
        slug: "frontmatter-hidden-string",
        frontmatter: { title: "String hidden", tags: ["monitoring"], hidden: "true" },
      },
      { slug: "networking", frontmatter: { title: "Network", tags: ["network"] } },
    ]
    const output = FlatTagContent()(
      props({ slug: "monitoring", frontmatter: { flatTag: "monitoring" } }, files),
    )
    const html = render(output as Parameters<typeof render>[0])
    expect(html).toContain('href="/elastic-stack"')
    expect(html).not.toContain("Hidden")
    expect(html).not.toContain("Frontmatter hidden")
    expect(html).not.toContain("String hidden")
    expect(html).not.toContain("Network")
  })

  it("lists notes assigned through area frontmatter on generated area pages", () => {
    const files = [
      {
        slug: "elastic-stack",
        frontmatter: { title: "Elastic", area: ["[[Инфраструктура]]"] },
      },
      { slug: "other", frontmatter: { title: "Other", area: ["[[Tech Stack]]"] } },
    ]
    const output = FlatTagContent()(
      props(
        {
          slug: "infrastruktura",
          frontmatter: {
            flatTag: "infrastruktura",
            flatArea: true,
            title: "Инфраструктура",
          },
        },
        files,
      ),
    )
    const html = render(output as Parameters<typeof render>[0])
    expect(html).toContain("Заметки в области")
    expect(html).toContain('href="/elastic-stack"')
    expect(html).not.toContain("Other")
  })
})

describe("FlatTagPage", () => {
  it("claims only descriptors with string flatTag frontmatter", () => {
    const match = FlatTagPage().match
    const base = { slug: "monitoring" as FullSlug, cfg: {} }
    expect(
      match({ ...base, fileData: { frontmatter: { title: "Tag", flatTag: "monitoring" } } }),
    ).toBe(true)
    expect(match({ ...base, fileData: { frontmatter: { title: "Tag", flatTag: true } } })).toBe(
      false,
    )
    expect(match({ ...base, fileData: { frontmatter: { title: "Page" } } })).toBe(false)
  })
})

describe("FlatTagRoutes", () => {
  it("rewrites descriptors after ASCII normalization and updates allSlugs", () => {
    const ctx = { allSlugs: ["_flat-tags/monitoring"] } as never
    const plugin = FlatTagRoutes().markdownPlugins?.(ctx)?.[0] as () => (
      tree: unknown,
      file: { data: Record<string, unknown> },
    ) => void
    const transform = plugin()
    const file = {
      data: {
        slug: "flat-tags/monitoring",
        relativePath: "_flat-tags/monitoring.md",
        frontmatter: { title: "Monitoring", flatTag: "monitoring" },
      },
    }
    transform({}, file)
    expect(file.data.slug).toBe("monitoring")
    expect(ctx.allSlugs).toEqual(["monitoring"])
  })
})
