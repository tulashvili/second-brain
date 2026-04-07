import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types"
import "./styles/allnotes.scss"

const NavAllNotes: QuartzComponent = (_props: QuartzComponentProps) => {
  return (
    <div class="nav-all-notes">
      <a href="/notes">Все заметки</a>
    </div>
  )
}

export default (() => NavAllNotes) satisfies QuartzComponentConstructor