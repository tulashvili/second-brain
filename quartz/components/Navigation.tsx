import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

import style from "./styles/navmenu.scss"
import Darkmode from "./Darkmode"

const Navigation: QuartzComponent = (props: QuartzComponentProps) => {
  const slug = props.fileData.slug ?? ""
  const DarkmodeComponent = Darkmode()
  const isBrainActive =
    slug === "brain" ||
    slug === "notes" ||
    (!["index", "blog", "about", "projects"].includes(slug) && !slug.startsWith("tags/"))

  return (
    <nav class="top-navigation">
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
          <DarkmodeComponent {...props} />
        </div>
      </div>
    </nav>
  )
}

Navigation.css = style

export default (() => Navigation) satisfies QuartzComponentConstructor
