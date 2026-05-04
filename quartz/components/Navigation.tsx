import {
  QuartzComponent,
  QuartzComponentConstructor,
} from "./types"

import style from "./styles/navmenu.scss"

const Navigation: QuartzComponent = () => {
  return (
    <nav class="navigation">
      <section class="container">

        <div class="nav-left">
          <a href="/" class="navigation-title">
            Second Brain
          </a>

          <ul class="navigation-list">
            <li><a href="/notes">🧠 Все заметки</a></li>
            <li><a href="/about">👤 Обо мне</a></li>
          </ul>
        </div>
      </section>
    </nav>
  )
}

Navigation.css = style

export default (() => Navigation) satisfies QuartzComponentConstructor
