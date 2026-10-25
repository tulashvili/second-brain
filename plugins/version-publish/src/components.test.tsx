import assert from "node:assert/strict"
import test from "node:test"
import { render } from "preact-render-to-string"
import { VersionLabel } from "./components"

test("shows the published note version to readers", () => {
  const Component = VersionLabel()
  const html = render(
    Component({ fileData: { frontmatter: { version: "0.2" } } } as never) as Parameters<
      typeof render
    >[0],
  )
  assert.match(html, /Версия заметки/)
  assert.match(html, /0\.2/)
})

test("shows linked parent topics beside the note version", () => {
  const Component = VersionLabel()
  const html = render(
    Component({
      fileData: {
        slug: "proxy",
        frontmatter: { version: "0.2" },
        semanticUpLinks: ["network", "labs", "network", "missing", "plain"],
      },
      allFiles: [
        { slug: "network", frontmatter: { title: "Сетевая безопасность", moc: true } },
        { slug: "labs", frontmatter: { title: "Лаборатории", moc: true } },
        { slug: "plain", frontmatter: { title: "Plain" } },
      ],
    } as never) as Parameters<typeof render>[0],
  )
  assert.match(html, /Версия заметки: 0\.2/)
  assert.match(html, /Родительские темы:/)
  assert.match(html, /href="\/network"/)
  assert.match(html, /href="\/labs"/)
  assert.equal((html.match(/href="\/network"/g) ?? []).length, 1)
  assert.doesNotMatch(html, /missing|Plain/)
})

test("does not link hidden or generated parent pages", () => {
  const Component = VersionLabel()
  const html = render(
    Component({
      fileData: {
        slug: "proxy",
        frontmatter: { version: "0.2" },
        semanticUpLinks: ["index", "hidden", "tag", "unlisted"],
      },
      allFiles: [
        { slug: "index", frontmatter: { title: "Главная", moc: true } },
        { slug: "hidden", frontmatter: { title: "Скрытая", moc: true, hidden: "true" } },
        { slug: "tag", frontmatter: { title: "Тег", moc: true, flatTag: "tag" } },
        { slug: "unlisted", unlisted: true, frontmatter: { title: "Личная", moc: true } },
      ],
    } as never) as Parameters<typeof render>[0],
  )
  assert.match(html, /Родительская тема:/)
  assert.match(html, /href="\/"/)
  assert.doesNotMatch(html, /Скрытая|Тег|Личная/)
})

test("does not render a label without a version", () => {
  const Component = VersionLabel()
  const output = Component({ fileData: { frontmatter: {} } } as never)
  assert.equal(output == null ? "" : render(output as Parameters<typeof render>[0]), "")
})
