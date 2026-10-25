import assert from "node:assert/strict"
import test from "node:test"
import { render } from "preact-render-to-string"
import { NoteMetadata } from "./components"

const renderMetadata = (
  fileData: Record<string, unknown>,
  allFiles: Record<string, unknown>[],
  locale: string,
) => {
  const output = NoteMetadata()({ fileData, allFiles, cfg: { locale } } as never)
  return output == null ? "" : render(output as Parameters<typeof render>[0])
}

test("shows a Russian version and linked parent once", () => {
  const html = renderMetadata(
    { slug: "proxy", frontmatter: { version: "0.2" }, semanticUpLinks: ["network", "network"] },
    [{ slug: "network", frontmatter: { moc: true, title: "Сетевая безопасность" } }],
    "ru-RU",
  )
  assert.match(html, /Версия заметки: 0\.2/)
  assert.match(html, /Родительская тема:/)
  assert.equal((html.match(/href="\/network"/g) ?? []).length, 1)
})

test("shows English labels and localized links", () => {
  const html = renderMetadata(
    { slug: "linux-processes", frontmatter: { version: "1.0" }, semanticUpLinks: ["linux"] },
    [{ slug: "linux", frontmatter: { moc: true, title: "Linux" } }],
    "en-US",
  )
  assert.match(html, /Note version: 1\.0/)
  assert.match(html, /Parent topic:/)
  assert.match(html, /href="\/en\/linux"/)
})

test("shows a parent when version is absent and skips unpublished targets", () => {
  const html = renderMetadata(
    { slug: "proxy", frontmatter: {}, semanticUpLinks: ["network", "hidden", "tag", "missing"] },
    [
      { slug: "network", frontmatter: { moc: true, title: "Network" } },
      { slug: "hidden", frontmatter: { moc: true, hidden: "true" } },
      { slug: "tag", frontmatter: { moc: true, flatTag: "tag" } },
    ],
    "en-US",
  )
  assert.match(html, /href="\/en\/network"/)
  assert.doesNotMatch(html, /Note version|href="\/en\/(?:hidden|tag|missing)"/)
})

test("renders no metadata when neither field is present", () => {
  assert.equal(renderMetadata({ slug: "orphan", frontmatter: {} }, [], "ru-RU"), "")
})
