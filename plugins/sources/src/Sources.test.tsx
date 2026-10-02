import type { FullSlug } from "@quartz-community/types"
import { render } from "preact-render-to-string"
import { describe, expect, it } from "vitest"
import { parseSource } from "./parseSource"
import { Sources } from "./Sources"

describe("parseSource", () => {
  it("parses external, internal wiki, aliased, and plain sources", () => {
    expect(parseSource("https://example.com/reference", "elastic-stack" as FullSlug)).toEqual({
      label: "https://example.com/reference",
      href: "https://example.com/reference",
      external: true,
    })
    expect(
      parseSource("[[Физический уровень модели OSI|OSI layer]]", "elastic-stack" as FullSlug),
    ).toEqual({
      label: "OSI layer",
      href: "./fizicheskiy-uroven-modeli-osi",
      internalSlug: "fizicheskiy-uroven-modeli-osi",
      external: false,
    })
    expect(parseSource("RFC 1918", "elastic-stack" as FullSlug)).toEqual({
      label: "RFC 1918",
      external: false,
    })
    expect(parseSource("javascript:alert(1)", "elastic-stack" as FullSlug)).toEqual({
      label: "javascript:alert(1)",
      external: false,
    })
  })
})

describe("Sources", () => {
  const renderSources = (
    source: unknown,
    extra: Record<string, unknown> = {},
    allFiles: Record<string, unknown>[] = [{ slug: "osi" }],
  ) => {
    const Component = Sources()
    const output = Component({
      fileData: { slug: "elastic-stack", frontmatter: { title: "Elastic", source, ...extra } },
      allFiles,
    } as never)
    return output == null ? "" : render(output as Parameters<typeof render>[0])
  }

  it("renders multiple sources and secures external links", () => {
    const html = renderSources(["https://example.com", "[[OSI]]", "Book", "  "])
    expect(html).toContain("Источники")
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).toContain('href="./osi"')
    expect(html).toContain("<span>Book</span>")
    expect(html).not.toContain("<li>  </li>")
  })

  it("never turns unsafe URL schemes into links", () => {
    const html = renderSources(["javascript:alert(1)", "data:text/html,hello"])
    expect(html).toContain("javascript:alert(1)")
    expect(html).toContain("data:text/html,hello")
    expect(html).not.toContain("href=")
  })

  it("renders an unpublished internal source as text instead of a broken link", () => {
    const html = renderSources("[[Мистер Робот]]")
    expect(html).toContain("<span>Мистер Робот</span>")
    expect(html).not.toContain("href=")
  })

  it("renders nothing for absent or empty sources", () => {
    expect(renderSources(undefined)).toBe("")
    expect(renderSources(["", "  "])).toBe("")
  })

  it.each(["index", "about", "projects"])("suppresses sources on %s", (slug) => {
    const Component = Sources()
    expect(
      Component({ fileData: { slug, frontmatter: { title: slug, source: "Book" } } } as never),
    ).toBeNull()
  })

  it("suppresses sources on flat tag descriptors", () => {
    const Component = Sources()
    expect(
      Component({
        fileData: {
          slug: "monitoring",
          frontmatter: { title: "Tag", flatTag: "monitoring", source: "Book" },
        },
      } as never),
    ).toBeNull()
  })
})
