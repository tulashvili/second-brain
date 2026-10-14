import { render } from "preact-render-to-string"
import { describe, expect, it } from "vitest"
import { LanguageSelector } from "./LanguageSelector"

const htmlFor = (locale: string, slug: string, translationKey?: string): string => {
  const Component = LanguageSelector()
  return render(
    Component({
      cfg: { locale },
      fileData: { slug, frontmatter: { translationKey } },
    } as never) as Parameters<typeof render>[0],
  )
}

describe("LanguageSelector", () => {
  it("renders one global switch through the language endpoint for a paired article", () => {
    const ru = htmlFor("ru-RU", "protsessy-v-linux", "protsessy-v-linux")
    const en = htmlFor("en-US", "linux-processes", "protsessy-v-linux")
    expect(ru).toContain('aria-label="Язык сайта"')
    expect(ru).toContain('href="/__language?lang=en&amp;next=%2Fen%2Flinux-processes"')
    expect(en).toContain('href="/__language?lang=ru&amp;next=%2Fprotsessy-v-linux"')
    expect(en).toContain('aria-current="true"')
    expect(ru.match(/class="language-selector"/g)).toHaveLength(1)
  })

  it("falls back to locale homes for generated and unknown pages", () => {
    const html = htmlFor("ru-RU", "unknown-generated-page")
    expect(html).toContain("next=%2Fen%2F")
    expect(html).toContain("next=%2Fru%2F")
  })
})
