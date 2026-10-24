import { execFile } from "node:child_process"
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { promisify } from "node:util"
import { syncFlatTagPages } from "./sync-flat-tags"
import { filterUnpublishedNotes } from "./publish-policy"

const execFileAsync = promisify(execFile)
const projectRoot = process.cwd()
const outputOption = process.argv.indexOf("--output")
const output = path.resolve(
  outputOption < 0 ? "public" : (process.argv[outputOption + 1] ?? "public"),
)
const canonicalRoot = "https://security.maybeso.me/"

const build = async (config: string, content: string, destination: string): Promise<void> => {
  const { stdout, stderr } = await execFileAsync(
    "npx",
    ["quartz", "build", "--config", config, "--directory", content, "--output", destination],
    { cwd: projectRoot, maxBuffer: 10_000_000 },
  )
  process.stdout.write(stdout)
  process.stderr.write(stderr)
}

const setRussianHomeCanonical = (html: string): string =>
  html
    .replace(
      `<link rel="canonical" href="${canonicalRoot}"`,
      `<link rel="canonical" href="${canonicalRoot}ru/"`,
    )
    .replaceAll(
      `<meta property="og:url" content="${canonicalRoot}"`,
      `<meta property="og:url" content="${canonicalRoot}ru/"`,
    )
    .replaceAll(
      `<meta property="twitter:url" content="${canonicalRoot}"`,
      `<meta property="twitter:url" content="${canonicalRoot}ru/"`,
    )

const main = async (): Promise<void> => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "quartz-bilingual-"))
  const ruContent = path.join(temporary, "ru", "content")
  const enContent = path.join(temporary, "en", "content")
  const ruOutput = path.join(temporary, "ru-public")
  const enOutput = path.join(temporary, "en-public")
  try {
    await execFileAsync("npx", ["tsx", "scripts/check-translations.ts", "--check"], {
      cwd: projectRoot,
    })
    await cp(path.join(projectRoot, "content", "ru"), ruContent, { recursive: true })
    await cp(path.join(projectRoot, "content", "en"), enContent, { recursive: true })
    await cp(path.join(projectRoot, "content", "ru", "assets"), path.join(enContent, "assets"), {
      recursive: true,
    })

    await filterUnpublishedNotes(ruContent)
    await filterUnpublishedNotes(enContent)

    const reserved = ["404", "CNAME", "index.xml", "sitemap.xml", "static"]
    await syncFlatTagPages(ruContent, reserved)
    await syncFlatTagPages(enContent, reserved)
    await build("quartz.config.yaml", ruContent, ruOutput)
    await build("quartz.config.en.yaml", enContent, enOutput)

    await rm(output, { recursive: true, force: true })
    await cp(ruOutput, output, { recursive: true })
    await cp(enOutput, path.join(output, "en"), { recursive: true })

    const russianHome = setRussianHomeCanonical(
      await readFile(path.join(output, "index.html"), "utf8"),
    )
    await writeFile(path.join(output, "index.html"), russianHome)
    // The alias lives one level deeper, while Quartz emits root-relative document assets as ./.
    await mkdir(path.join(output, "ru"), { recursive: true })
    await writeFile(
      path.join(output, "ru", "index.html"),
      russianHome.replace("<head>", '<head><base href="/">'),
    )
    const sitemap = await readFile(path.join(output, "sitemap.xml"), "utf8")
    await writeFile(
      path.join(output, "sitemap.xml"),
      sitemap.replace(canonicalRoot + "<", canonicalRoot + "ru/<"),
    )
  } finally {
    await rm(temporary, { recursive: true, force: true })
  }
}

await main()
