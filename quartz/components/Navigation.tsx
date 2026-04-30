import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { concatenateResources } from "../util/resources"

import style from "./styles/navmenu.scss"
import Darkmode from "./Darkmode"
import Search from "./Search"

const DarkmodeComponent = Darkmode()
const SearchComponent = Search({ enablePreview: true })

const Navigation: QuartzComponent = (props: QuartzComponentProps) => {
  // Quick toggle: set to false to return to default sticky behavior.
  const pinToViewport = false
  const slug = props.fileData.slug ?? ""
  const isBrainActive =
    slug === "brain" ||
    slug === "notes" ||
    (!["index", "blog", "about", "projects"].includes(slug) && !slug.startsWith("tags/"))

  return (
    <nav class={`top-navigation ${pinToViewport ? "is-fixed" : ""}`}>
      <div class="top-navigation-inner">
        <a href="/" class="site-brand">
          BITSNBEING
        </a>

        <ul class="top-navigation-list">
          <li>
            <a class={slug === "blog" ? "active" : ""} href="/blog">
              ✏️ Блог
            </a>
          </li>
          <li>
            <a class={isBrainActive ? "active" : ""} href="/brain">
              🧠 Второй мозг
            </a>
          </li>
          <li class="nav-separator" aria-hidden="true">
            |
          </li>
          <li>
            <a class={slug === "about" ? "active" : ""} href="/about">
              👤 Обо мне
            </a>
          </li>
          <li>
            <a class={slug === "projects" ? "active" : ""} href="/projects">
              🧪 Проекты
            </a>
          </li>
        </ul>

        <div class="top-navigation-theme">
          <SearchComponent {...props} />
          <DarkmodeComponent {...props} />
        </div>
      </div>
    </nav>
  )
}

Navigation.css = concatenateResources(style, DarkmodeComponent.css, SearchComponent.css)
Navigation.beforeDOMLoaded = concatenateResources(DarkmodeComponent.beforeDOMLoaded)
Navigation.afterDOMLoaded = concatenateResources(SearchComponent.afterDOMLoaded)

export default (() => Navigation) satisfies QuartzComponentConstructor
