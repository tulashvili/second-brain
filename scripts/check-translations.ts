import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import YAML from "yaml"
import { toFlatAsciiSlug } from "../plugins/ascii-slug/src/slug"

type Locale = "ru" | "en"
type Note = { key: string; source: string; slug: string; pending: boolean }
type BaselinePage = { source: string; slug: string; url: string }
type RoutePair = { ruPath: string; enPath: string; ruUrl: string; enUrl: string }

const option = (name: string, fallback: string): string => {
  const index = process.argv.indexOf(name)
  return index === -1 ? fallback : (process.argv[index + 1] ?? fallback)
}

const contentRoot = path.resolve(option("--content", "content"))
const baselinePath = path.resolve(option("--baseline", "docs/localization/published-baseline.json"))
const outputPath = path.resolve(option("--output", "localization/route-pairs.json"))

function markdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".") || entry.name === "_flat-tags" || entry.name === "assets") {
      return []
    }
    const candidate = path.join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(candidate)
    return entry.isFile() && entry.name.endsWith(".md") ? [candidate] : []
  })
}

function readNote(file: string, locale: Locale): Note {
  const source = readFileSync(file, "utf8")
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) throw new Error(`missing frontmatter: ${file}`)
  const metadata = YAML.parse(match[1]) as Record<string, unknown>
  if (typeof metadata.translationKey !== "string" || !metadata.translationKey) {
    throw new Error(`missing translationKey: ${file}`)
  }
  const relative = path.relative(path.join(contentRoot, locale), file).split(path.sep).join("/")
  return {
    key: metadata.translationKey,
    source: `content/${locale}/${relative}`.normalize("NFC"),
    slug: toFlatAsciiSlug(path.basename(file, ".md")),
    pending: metadata.translationPending === true,
  }
}

function localeNotes(locale: Locale): Map<string, Note> {
  const notes = new Map<string, Note>()
  for (const file of markdownFiles(path.join(contentRoot, locale))) {
    const note = readNote(file, locale)
    if (notes.has(note.key)) throw new Error(`duplicate translationKey ${note.key}: ${file}`)
    notes.set(note.key, note)
  }
  return notes
}

function collectPairs(): Record<string, RoutePair> {
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8")) as { pages: BaselinePage[] }
  const ru = localeNotes("ru")
  const en = localeNotes("en")
  const pairs: Record<string, RoutePair> = {}
  const englishSlugs = new Set<string>()

  for (const page of baseline.pages) {
    const russian = ru.get(page.slug)
    const english = en.get(page.slug)
    if (!russian) throw new Error(`missing Russian counterpart: ${page.slug}`)
    if (!english) throw new Error(`missing English counterpart: ${page.slug}`)
    const expectedRussian = page.source.replace(/^content\//, "content/ru/").normalize("NFC")
    if (russian.source !== expectedRussian || russian.slug !== page.slug) {
      throw new Error(`Russian source or slug changed for ${page.slug}`)
    }
    if (russian.pending || english.pending) throw new Error(`translation is pending: ${page.slug}`)
    if (englishSlugs.has(english.slug)) throw new Error(`duplicate English slug: ${english.slug}`)
    englishSlugs.add(english.slug)
    pairs[page.slug] = {
      ruPath: russian.source,
      enPath: english.source,
      ruUrl: page.url,
      enUrl: `https://security.maybeso.me/en/${english.slug === "index" ? "" : english.slug}`,
    }
  }
  if (ru.size !== baseline.pages.length || en.size !== baseline.pages.length) {
    throw new Error("unpublished or unpaired authored content is present")
  }
  return pairs
}

try {
  const pairs = collectPairs()
  const serialized = JSON.stringify(pairs, null, 2) + "\n"
  if (process.argv.includes("--check")) {
    if (readFileSync(outputPath, "utf8") !== serialized) {
      throw new Error(`stale translation map: ${outputPath}`)
    }
  } else {
    mkdirSync(path.dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, serialized)
  }
  console.log(`Validated ${Object.keys(pairs).length} translation pairs`)
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
