import { describe, expect, it } from "vitest"
import { canonicalTagSlug, collectRouteClaims, validateRouteClaims } from "./routes"

const reserved = ["404", "CNAME", "index.xml", "sitemap.xml", "static"]

describe("flat route manifest", () => {
  it("accepts distinct article and tag routes", () => {
    const claims = collectRouteClaims(
      [{ slug: "elastic-stack", source: "Elastic Stack.md" }],
      ["monitoring"],
      reserved,
    )
    expect(() => validateRouteClaims(claims)).not.toThrow()
    expect(canonicalTagSlug("Мониторинг")).toBe("monitoring")
  })

  it("rejects an article versus tag collision", () => {
    const claims = collectRouteClaims(
      [{ slug: "monitoring", source: "Monitoring.md" }],
      ["Monitoring"],
      reserved,
    )
    expect(() => validateRouteClaims(claims)).toThrow(
      /monitoring.*Monitoring\.md.*tag:Monitoring/is,
    )
  })

  it("rejects case and transliteration collisions with all sources", () => {
    const claims = collectRouteClaims([], ["Сеть", "сеть", "SET"], reserved)
    for (const source of ["tag:Сеть", "tag:сеть", "tag:SET"]) {
      expect(() => validateRouteClaims(claims)).toThrow(source)
    }
  })

  it.each(["404", "CNAME", "index.xml", "sitemap.xml", "static"])(
    "rejects a tag colliding with reserved route %s",
    (tag) => {
      const claims = collectRouteClaims([], [tag], reserved)
      expect(() => validateRouteClaims(claims)).toThrow(new RegExp(`reserved:${tag}`, "i"))
    },
  )

  it("rejects duplicate normalized tags", () => {
    const claims = collectRouteClaims([], ["Info Sec", "info-sec"], reserved)
    expect(() => validateRouteClaims(claims)).toThrow(/info-sec.*tag:Info Sec.*tag:info-sec/is)
  })
})
