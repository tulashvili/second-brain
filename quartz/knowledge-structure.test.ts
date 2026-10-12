import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import YAML from "yaml"
import { toAsciiSlug, toFlatAsciiSlug } from "../plugins/ascii-slug/src/slug"
import { extractSemanticTargets } from "../plugins/semantic-navigation/src/semanticLinks"
import {
  isMocPage,
  isPublishedArticle,
  validateKnowledgeGraph,
  type KnowledgeFile,
} from "../plugins/semantic-navigation/src/model"

type ContentPage = KnowledgeFile & {
  fileName: string
  relativePath: string
  markdown: string
  rawParents: string[]
}

const contentDir = path.join(process.cwd(), "content")

const parseFrontmatter = (markdown: string): Record<string, unknown> => {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  return match ? (YAML.parse(match[1]) ?? {}) : {}
}

const inlineSemanticTargets = (markdown: string, direction: "up" | "down"): string[] =>
  extractSemanticTargets(
    [...markdown.matchAll(new RegExp(`^\\s*${direction}\\s*::\\s*(.+)$`, "gim"))].map(
      (match) => match[1],
    ),
  )

const markdownFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      if (entry.name.startsWith(".") || entry.name === "_flat-tags" || entry.name === "assets") {
        return []
      }
      const absolutePath = path.join(directory, entry.name)
      if (entry.isDirectory()) return markdownFiles(absolutePath)
      return entry.isFile() && entry.name.endsWith(".md") ? [absolutePath] : []
    }),
  )
  return nested.flat().sort((left, right) => left.localeCompare(right))
}

const loadPages = async (): Promise<ContentPage[]> => {
  const files = await markdownFiles(contentDir)
  return Promise.all(
    files.map(async (absolutePath) => {
      const relativePath = path.relative(contentDir, absolutePath)
      const fileName = path.basename(relativePath)
      const markdown = await readFile(absolutePath, "utf8")
      const frontmatter = parseFrontmatter(markdown)
      const rawParents = [
        ...new Set([
          ...extractSemanticTargets(frontmatter.up),
          ...inlineSemanticTargets(markdown, "up"),
        ]),
      ]
      const baseName = fileName.replace(/\.md$/, "")
      return {
        fileName,
        markdown,
        relativePath,
        slug: baseName === "index" ? "index" : toFlatAsciiSlug(baseName),
        frontmatter,
        rawParents,
        semanticUpLinks: rawParents.map(toAsciiSlug),
      }
    }),
  )
}

const levelOneMocs = ["Основы информационной безопасности", "Linux"]

const levelTwoMocs = [
  "Сетевая безопасность",
  "Атаки и угрозы",
  "Обнаружение, логирование и мониторинг",
  "Безопасность инфраструктуры",
  "Безопасность приложений и веб-сервисов",
  "Операционная безопасность и инструменты",
  "Лабы и практические руководства",
]

const expectedMocParents: Record<string, string[]> = {
  index: [],
  ...Object.fromEntries(levelOneMocs.map((title) => [title, ["index"]])),
  ...Object.fromEntries(
    levelTwoMocs.map((title) => [title, ["Основы информационной безопасности"]]),
  ),
  "Сети и протоколы": ["Сетевая безопасность"],
  "Инфраструктура и платформы": ["Безопасность инфраструктуры"],
  "Хранение данных": ["Безопасность инфраструктуры"],
  "Программирование и автоматизация": ["Операционная безопасность и инструменты"],
  "Инструменты и технологии": ["Операционная безопасность и инструменты"],
  "Авторизация и аутентификация": ["Безопасность приложений и веб-сервисов"],
}

const labs = "Лабы и практические руководства"
const expectedArticleParents: Record<string, string[]> = {
  "Auth.log": ["Авторизация и аутентификация", "Обнаружение, логирование и мониторинг"],
  Awscli: ["Хранение данных", labs],
  "CAN (Campus Area Network)": ["Сети и протоколы"],
  CDN: ["Сетевая безопасность"],
  "DIY-гаджет для трейдинга без эмоций": ["Программирование и автоматизация"],
  "Elastic Stack": ["Обнаружение, логирование и мониторинг"],
  Gitlab: ["Инструменты и технологии"],
  "Gitlab Runner": ["Инструменты и технологии"],
  "LAN (Local Area Network)": ["Сети и протоколы"],
  "Minio Client": ["Хранение данных", labs],
  OSI: ["Сети и протоколы"],
  "Out of memory (OOM)": ["Инфраструктура и платформы"],
  "PAN (Personal Area Network)": ["Сети и протоколы"],
  Proxmox: ["Инфраструктура и платформы"],
  Proxy: ["Сетевая безопасность"],
  "R.U.D.Y (R-U-Dead-Yet)": ["Атаки и угрозы"],
  SPOF: ["Безопасность инфраструктуры"],
  "SSL Upstream Injection": ["Безопасность приложений и веб-сервисов", "Сетевая безопасность"],
  "Slow Attack": ["Атаки и угрозы"],
  "Swaks. Простой клиент для отправки писем с сервера": ["Инструменты и технологии", labs],
  Syncthing: ["Инфраструктура и платформы"],
  balenaEtcher: ["Инструменты и технологии", labs],
  nginx_worker_process: ["Инфраструктура и платформы"],
  "Гайд по использованию mysqldump": ["Хранение данных", labs],
  "Коммутатор vs Маршрутизатор": ["Сети и протоколы"],
  Коммутатор: ["Сети и протоколы"],
  "Компьютерные сети": ["Сети и протоколы"],
  "Лог коллектор": ["Обнаружение, логирование и мониторинг"],
  Маршрутизатор: ["Сети и протоколы"],
  "Мультиконтейнерное приложение в Docker (docker network)": ["Инфраструктура и платформы", labs],
  "Настройка forward proxy в Nginx c basic auth": [
    "Авторизация и аутентификация",
    "Безопасность приложений и веб-сервисов",
    labs,
  ],
  "Развертывание Elastic Stack": ["Обнаружение, логирование и мониторинг", labs],
  "Типы атак на информационные системы": ["Атаки и угрозы"],
  "Физический уровень модели OSI": ["Сети и протоколы"],
  "Цепочка доставки логов с использованием Elastic Stack": [
    "Обнаружение, логирование и мониторинг",
  ],
  "Hardening (усиление безопасности)": [
    "Безопасность инфраструктуры",
    "Операционная безопасность и инструменты",
  ],
  "HSTS (HTTP Strict Transport Security)": [
    "Безопасность приложений и веб-сервисов",
    "Сетевая безопасность",
  ],
  "Процессы в Linux": ["Linux"],
}

const expectedMocLevel = new Map(
  [
    ...levelOneMocs.map((name) => [name, "1-level-knowledge"] as const),
    ...levelTwoMocs.map((name) => [name, "2-level-knowledge"] as const),
    ...[
      "Сети и протоколы",
      "Инфраструктура и платформы",
      "Хранение данных",
      "Программирование и автоматизация",
      "Инструменты и технологии",
      "Авторизация и аутентификация",
    ].map((name) => [name, "3-level-knowledge"] as const),
  ].map(([name, level]) => [name.normalize("NFC"), level]),
)

const sorted = (values: readonly string[]): string[] =>
  values.map((value) => value.normalize("NFC")).sort((left, right) => left.localeCompare(right))

const normalizedRecord = <T>(record: Record<string, T>): Record<string, T> =>
  Object.fromEntries(Object.entries(record).map(([key, value]) => [key.normalize("NFC"), value]))

test("knowledge structure matches the approved security-first MOC hierarchy", async () => {
  const pages = await loadPages()
  const articles = pages.filter(isPublishedArticle)
  const mocs = pages.filter(isMocPage)
  const articleParents = normalizedRecord(expectedArticleParents)
  const mocParents = normalizedRecord(expectedMocParents)

  assert.equal(articles.length, 38)
  assert.equal(mocs.length, 16)
  assert.deepEqual(
    sorted(articles.map((page) => page.fileName.replace(/\.md$/, ""))),
    sorted(Object.keys(expectedArticleParents)),
  )
  assert.deepEqual(
    sorted(
      mocs.map((page) =>
        page.fileName === "index.md" ? "index" : page.fileName.replace(/\.md$/, ""),
      ),
    ),
    sorted(Object.keys(expectedMocParents)),
  )

  for (const article of articles) {
    const name = article.fileName.replace(/\.md$/, "").normalize("NFC")
    assert.equal(path.dirname(article.relativePath), "4-level-knowledge", `${name} level`)
    assert.deepEqual(sorted(article.rawParents), sorted(articleParents[name]), name)
    assert.equal(Object.hasOwn(article.frontmatter ?? {}, "area"), false, `${name} retains area`)
    assert.equal(Object.hasOwn(article.frontmatter ?? {}, "down"), false, `${name} stores down`)
    assert.deepEqual(
      inlineSemanticTargets(article.markdown, "down"),
      [],
      `${name} stores inline down`,
    )
  }

  for (const moc of mocs) {
    const name =
      moc.fileName === "index.md" ? "index" : moc.fileName.replace(/\.md$/, "").normalize("NFC")
    assert.equal(
      path.dirname(moc.relativePath),
      name === "index" ? "." : expectedMocLevel.get(name),
      `${name} level`,
    )
    assert.deepEqual(sorted(moc.rawParents), sorted(mocParents[name]), name)
    assert.deepEqual(moc.frontmatter?.tags, ["area"], `${name} tags`)
    assert.deepEqual(inlineSemanticTargets(moc.markdown, "down"), [], `${name} stores inline down`)
    assert.match(moc.markdown, /## Ключевые темы/)
  }

  assert.deepEqual(validateKnowledgeGraph(pages, "index"), [])
})
