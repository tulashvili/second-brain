import { describe, expect, it } from "vitest"
import type { BuildCtx, FullSlug } from "@quartz-community/types"
import { AsciiSlug } from "./index"
import { toAsciiSlug, toFlatAsciiSlug, transliterateSegment } from "./slug"

describe("transliterateSegment", () => {
  it("normalizes Latin text to lowercase kebab case", () => {
    expect(transliterateSegment("Elastic Stack")).toBe("elastic-stack")
  })

  it("transliterates Cyrillic with the established canonical map", () => {
    expect(transliterateSegment("Физический уровень модели OSI")).toBe(
      "fizicheskiy-uroven-modeli-osi",
    )
  })

  it("normalizes punctuation, ampersands, and repeated separators", () => {
    expect(transliterateSegment(" Proxy & CDN -- notes! ")).toBe("proxy-and-cdn-notes")
  })

  it("returns an empty string when no URL-safe content remains", () => {
    expect(transliterateSegment("✨?!")).toBe("")
  })
})

describe("toAsciiSlug", () => {
  it("normalizes nested path segments independently", () => {
    expect(toAsciiSlug("Раздел/Elastic Stack/✨/CDN")).toBe("razdel/elastic-stack/cdn")
  })

  it("canonicalizes equivalent case and Cyrillic inputs identically", () => {
    expect(toAsciiSlug("ФИЗИЧЕСКИЙ уровень")).toBe(toAsciiSlug("физический УРОВЕНЬ"))
  })
})

describe("toFlatAsciiSlug", () => {
  it("keeps nested source folders out of public content routes", () => {
    expect(toFlatAsciiSlug("2-level-knowledge/Сетевая безопасность")).toBe("setevaya-bezopasnost")
    expect(toFlatAsciiSlug("4-level-knowledge/OSI")).toBe("osi")
  })
})

describe("AsciiSlug link normalization", () => {
  it("rejects distinct nested source paths that collapse to the same route", () => {
    const ctx = {
      allSlugs: ["2-level-knowledge/Proxy", "4-level-knowledge/Proxy"] as FullSlug[],
      allFiles: ["2-level-knowledge/Proxy.md", "4-level-knowledge/Proxy.md"],
    } as BuildCtx

    expect(() => AsciiSlug().markdownPlugins?.(ctx)).toThrow(/duplicate flat slug.*proxy/i)
  })

  it("updates the shared route manifest when normalizing a page slug", () => {
    const ctx = {
      allSlugs: [
        "4-level-knowledge/r.u.d.y-(r-u-dead-yet)",
        "assets/pasted-image.png",
      ] as FullSlug[],
      allFiles: ["4-level-knowledge/r.u.d.y-(r-u-dead-yet).md", "assets/pasted-image.png"],
    } as BuildCtx
    const plugin = AsciiSlug().markdownPlugins?.(ctx)?.[0] as () => (
      tree: unknown,
      file: { data: Record<string, unknown> },
    ) => void
    const file = { data: { slug: "4-level-knowledge/r.u.d.y-(r-u-dead-yet)" } }

    plugin()({}, file)

    expect(file.data.slug).toBe("r-u-d-y-r-u-dead-yet")
    expect(ctx.allSlugs).toEqual(["r-u-d-y-r-u-dead-yet", "assets/pasted-image.png"])
  })

  it("maps CrawlLinks destinations onto canonical routes and disables missing targets", () => {
    const ctx = {
      allSlugs: ["index", "proxy", "r-u-d-y-r-u-dead-yet", "infrastruktura"] as FullSlug[],
    } as BuildCtx
    const plugin = AsciiSlug().htmlPlugins?.(ctx)?.[0] as () => (
      tree: Record<string, unknown>,
      file: { data: Record<string, unknown> },
    ) => void
    const transform = plugin()
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "a",
          properties: { href: "../4-level-knowledge/Proxy.md" },
          children: [{ type: "text", value: "Proxy" }],
        },
        {
          type: "element",
          tagName: "a",
          properties: { href: "R.U.D.Y (R-U-Dead-Yet)" },
          children: [{ type: "text", value: "R.U.D.Y" }],
        },
        {
          type: "element",
          tagName: "a",
          properties: { href: "Инфраструктура" },
          children: [{ type: "text", value: "Инфраструктура" }],
        },
        {
          type: "element",
          tagName: "a",
          properties: { href: "./missing", "data-slug": "missing" },
          children: [{ type: "text", value: "Missing" }],
        },
      ],
    }
    const file = {
      data: {
        slug: "index",
      },
    }

    transform(tree, file)

    const [qualified, rudy, area, missing] = tree.children as Array<Record<string, any>>
    expect(qualified.properties.href).toBe("./proxy")
    expect(rudy.properties.href).toBe("./r-u-d-y-r-u-dead-yet")
    expect(area.properties.href).toBe("./infrastruktura")
    expect(missing.tagName).toBe("span")
    expect(missing.properties.href).toBeUndefined()
    expect(missing.properties.className).toContain("broken-link")
  })
})
