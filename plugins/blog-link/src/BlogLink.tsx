import type { QuartzComponent, QuartzComponentConstructor } from "@quartz-community/types"
import styles from "./blog-link.scss"

export const BlogLink: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = () => (
    <a class="blog-link" href="https://maybeso.me" aria-label="Основной блог">
      BLOG
    </a>
  )
  Component.css = styles
  return Component
}
