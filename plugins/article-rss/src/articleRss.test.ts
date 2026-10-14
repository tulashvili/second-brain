import { describe, expect, it } from "vitest"
import {
  buildKnowledgeStructureManifest,
  renderArticleRss,
  selectRssArticles,
  type ArticleRssFile,
} from "./articleRss"

const file = (slug: string, title: string, data: Partial<ArticleRssFile> = {}): ArticleRssFile => ({
  slug,
  frontmatter: { title, ...data.frontmatter },
  description: `${title} description`,
  ...data,
})

describe("selectRssArticles", () => {
  it("includes visible articles and excludes MOCs, system pages, tags, hidden, and unlisted pages", () => {
    const files = [
      file("proxy", "Proxy"),
      file("network", "Network", { frontmatter: { moc: true } }),
      file("index", "Home", { frontmatter: { moc: true } }),
      file("about", "About"),
      file("public", "Public", { frontmatter: { flatTag: "public" } }),
      file("hidden", "Hidden", { frontmatter: { hidden: true } }),
      file("unlisted", "Unlisted", { unlisted: true }),
    ]
    expect(selectRssArticles(files).map((item) => item.slug)).toEqual(["proxy"])
  })

  it("sorts dated articles newest first and undated articles by title", () => {
    const files = [
      file("zeta", "Zeta"),
      file("old", "Old", {
        defaultDateType: "modified",
        dates: { modified: new Date("2025-01-01T00:00:00Z") },
      }),
      file("new", "New", {
        defaultDateType: "modified",
        dates: { modified: new Date("2026-01-01T00:00:00Z") },
      }),
      file("alpha", "Alpha"),
    ]
    expect(selectRssArticles(files).map((item) => item.slug)).toEqual([
      "new",
      "old",
      "alpha",
      "zeta",
    ])
  })
})

describe("renderArticleRss", () => {
  it("renders canonical links and escapes XML-sensitive titles and CDATA endings", () => {
    const xml = renderArticleRss(
      [file("proxy", "Proxy & Gateway", { description: "break ]]> safely" })],
      { baseUrl: "security.maybeso.me", pageTitle: "Security & Notes" },
    )
    expect(xml).toContain("<title>Security &amp; Notes</title>")
    expect(xml).toContain("<title>Proxy &amp; Gateway</title>")
    expect(xml).toContain("https://security.maybeso.me/proxy")
    expect(xml).toContain("]]&gt;")
  })

  it("uses English feed metadata and /en/ article links", () => {
    const xml = renderArticleRss([file("proxy", "Proxy")], {
      baseUrl: "security.maybeso.me/en",
      pageTitle: "SECURITY",
    })
    expect(xml).toContain("https://security.maybeso.me/en/proxy")
    expect(xml).toContain("Latest notes on SECURITY")
    expect(xml).not.toContain("Последние заметки")
  })

  it("renders a valid empty feed", () => {
    const xml = renderArticleRss([], {
      baseUrl: "security.maybeso.me",
      pageTitle: "Security",
    })
    expect(xml).toContain('<rss version="2.0">')
    expect(xml).not.toContain("<item>")
  })
})

describe("buildKnowledgeStructureManifest", () => {
  it("emits exact sorted article and MOC slug lists", () => {
    expect(
      buildKnowledgeStructureManifest([
        file("z-article", "Z"),
        file("index", "Home", { frontmatter: { moc: true } }),
        file("a-article", "A"),
        file("network", "Network", { frontmatter: { moc: true } }),
        file("public", "Public", { frontmatter: { flatTag: "public" } }),
      ]),
    ).toEqual({
      articleSlugs: ["a-article", "z-article"],
      mocSlugs: ["index", "network"],
    })
  })
})
