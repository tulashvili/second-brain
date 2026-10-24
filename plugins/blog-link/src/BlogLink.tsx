import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import styles from "./blog-link.scss"

export const BlogLink: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ cfg }: QuartzComponentProps) => (
    <div class="site-links">
      <a
        class="blog-link"
        href={cfg?.locale === "en-US" ? "https://maybeso.me/en/" : "https://maybeso.me"}
        aria-label={cfg?.locale === "en-US" ? "Main blog" : "Основной блог"}
      >
        BLOG
      </a>
      <a
        class="blog-link"
        href={cfg?.locale === "en-US" ? "https://omar-t.com/en/" : "https://omar-t.com/"}
      >
        {cfg?.locale === "en-US" ? "About me" : "Обо мне"}
      </a>
    </div>
  )
  Component.css = styles
  return Component
}
