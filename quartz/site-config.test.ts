import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import YAML from "yaml"

type PluginEntry = {
  source: string
  enabled: boolean
  layout?: { position?: string; priority?: number; group?: string }
}

test("uses the approved site identity and horizontal header", async () => {
  const config = YAML.parse(await readFile(path.join(process.cwd(), "quartz.config.yaml"), "utf8"))
  assert.equal(config.configuration.pageTitle, "SECURITY")
  assert.equal(config.configuration.locale, "ru-RU")
  assert.equal(config.configuration.baseUrl, "security.maybeso.me")

  const plugins = config.plugins as PluginEntry[]
  const plugin = (source: string) => plugins.find((entry) => entry.source === source)
  assert.deepEqual(plugin("@quartz-community/page-title")?.layout, {
    position: "header",
    priority: 10,
  })
  assert.deepEqual(plugin("./plugins/blog-link")?.layout, {
    position: "header",
    priority: 20,
    group: "header-actions",
  })
  assert.deepEqual(plugin("@quartz-community/search")?.layout, {
    position: "header",
    priority: 30,
    group: "header-actions",
  })
  assert.deepEqual(plugin("@quartz-community/darkmode")?.layout, {
    position: "header",
    priority: 40,
    group: "header-actions",
  })

  for (const source of [
    "@quartz-community/explorer",
    "@quartz-community/reader-mode",
    "@quartz-community/alias-redirects",
  ]) {
    assert.equal(plugin(source)?.enabled, false, `${source} must be disabled`)
  }
})

test("matches the maybeso.me palette without changing Second Brain typography", async () => {
  const config = YAML.parse(await readFile(path.join(process.cwd(), "quartz.config.yaml"), "utf8"))
  assert.deepEqual(config.configuration.theme.typography, {
    header: "Schibsted Grotesk",
    body: "Source Sans Pro",
    code: "IBM Plex Mono",
  })
  assert.deepEqual(config.configuration.theme.colors.lightMode, {
    light: "#f5f3ee",
    lightgray: "#d9ddd4",
    gray: "#737a72",
    darkgray: "#5c655d",
    dark: "#202521",
    secondary: "#315b49",
    tertiary: "#b56b4b",
    highlight: "rgba(49, 91, 73, 0.14)",
    textHighlight: "#e9e7e0",
  })
  assert.deepEqual(config.configuration.theme.colors.darkMode, {
    light: "#202521",
    lightgray: "#39413b",
    gray: "#a8afa8",
    darkgray: "#d9ddd4",
    dark: "#f5f3ee",
    secondary: "#91b6a4",
    tertiary: "#d28a69",
    highlight: "rgba(145, 182, 164, 0.18)",
    textHighlight: "#4a594f",
  })
})

test("serializes dependent local plugin installation on a clean checkout", async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(process.cwd(), "package.json"), "utf8"),
  ) as { scripts: Record<string, string> }

  assert.match(packageJson.scripts["install-plugins"], /--concurrency 1/)
  assert.match(packageJson.scripts["plugins:deps"], /plugins\/ascii-slug/)
  assert.doesNotMatch(packageJson.scripts["prepare:site"], /plugins:build/)
  assert.match(packageJson.scripts["test:site"], /plugins:deps/)
})

test("keeps the compact header and long tag titles inside mobile viewport", async () => {
  const css = await readFile(path.join(process.cwd(), "quartz/styles/custom.scss"), "utf8")
  assert.match(css, /\.page-header\s*>\s*header\s*\{[\s\S]*flex-direction:\s*row/)
  assert.match(css, /\.page-header\s*>\s*header\s*\{[\s\S]*display:\s*flex/)
  assert.match(css, /justify-content:\s*flex-start/)
  assert.match(css, /\.flat-tag-content[\s\S]*overflow-wrap:\s*anywhere/)
})
