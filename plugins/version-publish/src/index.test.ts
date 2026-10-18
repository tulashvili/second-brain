import assert from "node:assert/strict"
import test from "node:test"
import { isPublishableVersion, VersionPublish } from "./index"

test("publishes only notes with version 0.1 or newer", () => {
  for (const version of ["0.1", 0.1, "0.10", "0.2", "1.0", "2.3.1"]) {
    assert.equal(isPublishableVersion(version), true, String(version))
  }
  for (const version of [undefined, null, "", "0.01", "0.05", "0.0", "draft", "v0.1"]) {
    assert.equal(isPublishableVersion(version), false, String(version))
  }
})

test("filter reads version from page frontmatter", () => {
  const filter = VersionPublish()
  const publish = (version: unknown) =>
    filter.shouldPublish({} as never, [null, { data: { frontmatter: { version } } }] as never)

  assert.equal(publish("0.1"), true)
  assert.equal(publish("0.05"), false)
  assert.equal(filter.shouldPublish({} as never, [null, { data: {} }] as never), false)
  assert.equal(
    filter.shouldPublish(
      {} as never,
      [null, { data: { frontmatter: { flatTag: "area", generated: true } } }] as never,
    ),
    true,
  )
})
