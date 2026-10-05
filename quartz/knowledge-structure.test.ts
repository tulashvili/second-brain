import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import YAML from "yaml"
import { toAsciiSlug } from "../plugins/ascii-slug/src/slug"
import { extractSemanticTargets } from "../plugins/semantic-navigation/src/semanticLinks"
import {
  isMocPage,
  isPublishedArticle,
  validateKnowledgeGraph,
  type KnowledgeFile,
} from "../plugins/semantic-navigation/src/model"

type ContentPage = KnowledgeFile & {
  fileName: string
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

const loadPages = async (): Promise<ContentPage[]> => {
  const names = (await readdir(contentDir))
    .filter((name) => name.endsWith(".md"))
    .sort((left, right) => left.localeCompare(right))
  return Promise.all(
    names.map(async (fileName) => {
      const markdown = await readFile(path.join(contentDir, fileName), "utf8")
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
        slug: baseName === "index" ? "index" : toAsciiSlug(baseName),
        frontmatter,
        rawParents,
        semanticUpLinks: rawParents.map(toAsciiSlug),
      }
    }),
  )
}

const primaryMocs = [
  "Основы информационной безопасности",
  "Сетевая безопасность",
  "Атаки и угрозы",
  "Обнаружение, логирование и мониторинг",
  "Безопасность инфраструктуры",
  "Безопасность приложений и веб-сервисов",
  "Операционная безопасность и инструменты",
  "Лаборатории и практические руководства",
]

const expectedMocParents: Record<string, string[]> = {
  index: [],
  ...Object.fromEntries(primaryMocs.map((title) => [title, ["index"]])),
  "Сети и протоколы": ["Сетевая безопасность"],
  "Инфраструктура и платформы": ["Безопасность инфраструктуры"],
  "Хранение данных": ["Безопасность инфраструктуры"],
  "Программирование и автоматизация": ["Операционная безопасность и инструменты"],
  "Инструменты и технологии": ["Операционная безопасность и инструменты"],
}

const labs = "Лаборатории и практические руководства"
const expectedArticleParents: Record<string, string[]> = {
  "Auth.log": ["Обнаружение, логирование и мониторинг"],
  Awscli: ["Хранение данных", labs],
  "CAN (Campus Area Network)": ["Сети и протоколы"],
  CDN: ["Сетевая безопасность"],
  "DIY-гаджет для трейдинга без эмоций": ["Программирование и автоматизация"],
  "Elastic Stack": ["Обнаружение, логирование и мониторинг"],
  "LAN (Local Area Network)": ["Сети и протоколы"],
  "Minio Client": ["Хранение данных", labs],
  OSI: ["Сети и протоколы"],
  "Out of memory (OOM)": ["Инфраструктура и платформы"],
  "PAN (Personal Area Network)": ["Сети и протоколы"],
  Proxmox: ["Инфраструктура и платформы"],
  Proxy: ["Сетевая безопасность"],
  "R.U.D.Y (R-U-Dead-Yet)": ["Атаки и угрозы"],
  SPOF: ["Безопасность инфраструктуры"],
  "Slow Attack": ["Атаки и угрозы"],
  "Swaks. Простой клиент для отправки писем с сервера": ["Инструменты и технологии", labs],
  Syncthing: ["Инфраструктура и платформы"],
  balenaEtcher: ["Инструменты и технологии", labs],
  nginx_worker_process: ["Инфраструктура и платформы"],
  "Гайд по использованию mysqldump": ["Хранение данных", labs],
  "Как звук компьютера становится числами": ["Инфраструктура и платформы"],
  "Коммутатор vs Маршрутизатор": ["Сети и протоколы"],
  Коммутатор: ["Сети и протоколы"],
  "Компьютерные сети": ["Сети и протоколы"],
  "Лог коллектор": ["Обнаружение, логирование и мониторинг"],
  Маршрутизатор: ["Сети и протоколы"],
  "Мультиконтейнерное приложение в Docker (docker network)": ["Инфраструктура и платформы", labs],
  "Настройка forward proxy в Nginx c basic auth": ["Безопасность приложений и веб-сервисов", labs],
  "Развертывание Elastic Stack": ["Обнаружение, логирование и мониторинг", labs],
  "Типы атак на информационные системы": ["Атаки и угрозы"],
  "Физический уровень модели OSI": ["Сети и протоколы"],
  "Цепочка доставки логов с использованием Elastic Stack": [
    "Обнаружение, логирование и мониторинг",
  ],
}

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

  assert.equal(articles.length, 33)
  assert.equal(mocs.length, 14)
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
    assert.deepEqual(sorted(moc.rawParents), sorted(mocParents[name]), name)
    assert.deepEqual(moc.frontmatter?.tags, ["public", "area"], `${name} tags`)
    assert.deepEqual(inlineSemanticTargets(moc.markdown, "down"), [], `${name} stores inline down`)
    assert.match(moc.markdown, /## Ключевые темы/)
  }

  assert.deepEqual(validateKnowledgeGraph(pages, "index"), [])
})
