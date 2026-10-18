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

test("does not render a label without a version", () => {
  const Component = VersionLabel()
  const output = Component({ fileData: { frontmatter: {} } } as never)
  assert.equal(output == null ? "" : render(output as Parameters<typeof render>[0]), "")
})
