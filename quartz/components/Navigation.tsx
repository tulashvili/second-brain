import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types"

import style from "./styles/navmenu.scss"

import Search from "./Search"
import NavAllNotes from "./NavAllNotes"

const Navigation: QuartzComponent = (props: QuartzComponentProps) => {
  const SearchComponent = Search()
  const NavAllNotesComponent = NavAllNotes()

  return (
    <nav class="navigation">
      <section class="container">

        <div class="nav-left">
          <a href="/" class="navigation-title">
            Second Brain
          </a>

          <ul class="navigation-list">
            <li><a href="/notes">🧠 Все заметки</a></li>
            <li><a href="/blog">✏️ Блог</a></li>
            <li><a href="/about">👤 Обо мне</a></li>
          </ul>
        </div>
      </section>
    </nav>
  )
}

Navigation.css = style

export default (() => Navigation) satisfies QuartzComponentConstructor