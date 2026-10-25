import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { access, mkdtemp, readFile, readdir, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)
const pairs = JSON.parse(await readFile("localization/route-pairs.json", "utf8")) as Record<
  string,
  { ruUrl: string; enUrl: string }
>
const outputPath = (output: string, url: string): string => {
  const pathname = new URL(url).pathname
  return path.join(
    output,
    pathname === "/"
      ? "ru/index.html"
      : `${pathname.replace(/^\//, "").replace(/\/$/, "/index")}.html`,
  )
}
const exists = (file: string): Promise<boolean> =>
  access(file).then(
    () => true,
    () => false,
  )

test(
  "localized release keeps Russian routes and isolates English indexes",
  { timeout: 120_000 },
  async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "quartz-localized-build-"))
    const output = path.join(root, "public")
    try {
      await execFileAsync("npx", ["tsx", "scripts/build-localized-site.ts", "--output", output], {
        cwd: process.cwd(),
        env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH ?? ""}` },
        timeout: 120_000,
      })
      assert.equal(Object.keys(pairs).length, 54)
      for (const [key, pair] of Object.entries(pairs)) {
        const ru = await readFile(outputPath(output, pair.ruUrl), "utf8")
        const en = await readFile(outputPath(output, pair.enUrl), "utf8")
        assert.equal((ru.match(/class="language-selector"/g) ?? []).length, 1, key)
        assert.equal((en.match(/class="language-selector"/g) ?? []).length, 1, key)
        assert.match(en, /<html lang="en"/, key)
        assert.ok(en.includes(`hreflang="en" href="${pair.enUrl}"`), key)
      }
      const enFiles = (await readdir(path.join(output, "en"))).filter((name) =>
        name.endsWith(".html"),
      )
      for (const file of enFiles) {
        const html = await readFile(path.join(output, "en", file), "utf8")
        for (const [, ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
          if (ref.startsWith("/__language")) continue
          const url = new URL(
            ref.replaceAll("&amp;", "&"),
            `https://security.maybeso.me/en/${file}`,
          )
          if (url.host !== "security.maybeso.me") continue
          const pathname = decodeURIComponent(url.pathname).replace(/^\//, "")
          const options = [
            path.join(output, pathname),
            path.join(output, `${pathname}.html`),
            path.join(output, pathname, "index.html"),
          ]
          assert.ok((await Promise.all(options.map(exists))).some(Boolean), `${file}: ${ref}`)
        }
      }
      const ru = JSON.parse(await readFile(path.join(output, "static/contentIndex.json"), "utf8"))
      const en = JSON.parse(
        await readFile(path.join(output, "en/static/contentIndex.json"), "utf8"),
      )
      assert.ok(ru["ssl-upstream-injection"])
      assert.ok(en["ssl-upstream-injection"])
      assert.ok(en["information-security-fundamentals"])
      assert.equal(en["osnovy-informatsionnoy-bezopasnosti"], undefined)
      await readFile(path.join(output, "ssl-upstream-injection.html"), "utf8")
      await readFile(path.join(output, "en/information-security-fundamentals.html"), "utf8")
      const enProcesses = await readFile(path.join(output, "en/linux-processes.html"), "utf8")
      assert.match(enProcesses, /Note version: 1\.0/)
      assert.match(enProcesses, /Parent topic:/)
      assert.match(enProcesses, /href="\/en\/linux"/)
      assert.doesNotMatch(enProcesses, /class="semantic-parents"/)
      assert.match(
        enProcesses,
        /hreflang="ru" href="https:\/\/security\.maybeso\.me\/protsessy-v-linux"/,
      )
      assert.match(
        enProcesses,
        /hreflang="en" href="https:\/\/security\.maybeso\.me\/en\/linux-processes"/,
      )
      assert.match(enProcesses, /href="\/en\/linux"/)
      assert.doesNotMatch(enProcesses, /href="\/linux"/)
      const ru404 = await readFile(path.join(output, "404.html"), "utf8")
      const en404 = await readFile(path.join(output, "en/404.html"), "utf8")
      assert.equal((ru404.match(/class="language-selector"/g) ?? []).length, 1)
      assert.equal((en404.match(/class="language-selector"/g) ?? []).length, 1)
      assert.match(en404, /next=%2Fen%2F/)
      const ruHome = await readFile(path.join(output, "ru/index.html"), "utf8")
      const enHome = await readFile(path.join(output, "en/index.html"), "utf8")
      assert.match(ruHome, /https:\/\/security\.maybeso\.me\/ru\//)
      assert.match(enHome, /https:\/\/security\.maybeso\.me\/en\//)
      const base = ruHome.match(/<base href="([^"]+)"/)?.[1]
      const resolutionBase = new URL(base ?? "/ru/", "https://security.maybeso.me")
      for (const [, ref] of ruHome.matchAll(/(?:href|src)="([^"]+)"/g)) {
        if (ref.startsWith("/__language")) continue
        const url = new URL(ref.replaceAll("&amp;", "&"), resolutionBase)
        if (url.host !== "security.maybeso.me") continue
        const pathname = decodeURIComponent(url.pathname).replace(/^\//, "")
        const options = [
          path.join(output, pathname),
          path.join(output, `${pathname}.html`),
          path.join(output, pathname, "index.html"),
        ]
        assert.ok((await Promise.all(options.map(exists))).some(Boolean), `ru/index.html: ${ref}`)
      }
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  },
)
