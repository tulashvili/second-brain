import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import styles from "./styles/sources.scss"

const Sources: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const rawUrl = fileData.frontmatter?.url

  if (!rawUrl) return null

  const urls = Array.isArray(rawUrl) ? rawUrl : [rawUrl]

  return (
    <div class="sources">
      <h3>Источники</h3>
      <ul>
        {urls.map((u) => {
          if (typeof u !== "string") return null

          return (
            <li>
              <a href={u} target="_blank" rel="noopener noreferrer">
                {u}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// 👇 ВАЖНО
Sources.css = styles

export default (() => Sources) satisfies QuartzComponentConstructor