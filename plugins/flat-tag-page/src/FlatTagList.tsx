import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { canonicalTagSlug } from "./routes"

type PageData = Record<string, unknown> & {
  frontmatter?: Record<string, unknown>
}

const values = (value: unknown): string[] =>
  (Array.isArray(value) ? value : value == null ? [] : [value]).map(String)

export const FlatTagList: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const tags = values((fileData as PageData).frontmatter?.tags)
    if (tags.length === 0) return null

    return (
      <ul class="flat-tag-list" aria-label="Теги">
        {tags.map((tag) => (
          <li>
            <a class="internal tag-link" href={`/${canonicalTagSlug(tag)}`}>
              {tag}
            </a>
          </li>
        ))}
      </ul>
    )
  }
  return Component
}
