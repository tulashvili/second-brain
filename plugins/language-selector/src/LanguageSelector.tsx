import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import pairs from "../../../localization/route-pairs.json"
import styles from "./language-selector.scss"

type Pair = { ruUrl: string; enUrl: string }
const routes = pairs as Record<string, Pair>
const home = { ru: "/ru/", en: "/en/" }

export const pathsForTranslation = (key: string | undefined): { ru: string; en: string } => {
  const pair = key ? routes[key] : undefined
  if (!pair) return home
  const ru = new URL(pair.ruUrl).pathname
  return { ru: ru === "/" ? home.ru : ru, en: new URL(pair.enUrl).pathname }
}

export const LanguageSelector: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ cfg, fileData }: QuartzComponentProps) => {
    const current = cfg.locale === "en-US" ? "en" : "ru"
    const key = fileData.frontmatter?.translationKey
    const paths = pathsForTranslation(typeof key === "string" ? key : undefined)
    const hrefFor = (lang: "ru" | "en") =>
      `/__language?${new URLSearchParams({ lang, next: paths[lang] }).toString()}`

    return (
      <nav class="language-selector" aria-label={current === "ru" ? "Язык сайта" : "Site language"}>
        <a href={hrefFor("ru")} lang="ru" aria-current={current === "ru" ? "true" : undefined}>
          RU
        </a>
        <a href={hrefFor("en")} lang="en" aria-current={current === "en" ? "true" : undefined}>
          EN
        </a>
      </nav>
    )
  }
  Component.css = styles
  return Component
}
