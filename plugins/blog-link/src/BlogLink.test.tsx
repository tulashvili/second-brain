import { render } from "preact-render-to-string"
import { describe, expect, it } from "vitest"
import { BlogLink } from "./BlogLink"

describe("BlogLink", () => {
  it("opens the matching English blog homepage", () => {
    const html = render(
      BlogLink()({ cfg: { locale: "en-US" } } as never) as Parameters<typeof render>[0],
    )
    expect(html).toContain('href="https://maybeso.me/en/"')
    expect(html).toContain('aria-label="Main blog"')
  })

  it("renders the main blog in the current tab", () => {
    const Component = BlogLink()
    const output = Component({} as never)
    const html = render(output as Parameters<typeof render>[0])
    expect(html).toContain(">BLOG<")
    expect(html).toContain('href="https://maybeso.me"')
    expect(html).not.toContain("target=")
    expect(html).toContain('aria-label="Основной блог"')
  })
})
