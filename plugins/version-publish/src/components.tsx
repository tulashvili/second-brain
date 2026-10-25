import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { h } from "preact"

export const VersionLabel: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    const version = fileData.frontmatter?.version
    if (typeof version !== "string" && typeof version !== "number") return null
    const upLinks = (fileData as typeof fileData & { semanticUpLinks?: string[] }).semanticUpLinks
    const parentSlugs = [...new Set(upLinks ?? [])]
    const parents = parentSlugs
      .map((slug) =>
        allFiles?.find(
          (file) =>
            file.slug === slug &&
            file.frontmatter?.moc === true &&
            file.unlisted !== true &&
            file.frontmatter?.hidden !== true &&
            file.frontmatter?.hidden !== "true" &&
            typeof file.frontmatter?.flatTag !== "string",
        ),
      )
      .filter((file): file is NonNullable<typeof file> => file !== undefined)
    return h(
      "div",
      { class: "note-metadata" },
      h("p", { class: "note-version" }, `Версия заметки: ${String(version)}`),
      parents.length > 0
        ? h(
            "nav",
            { class: "note-parents", "aria-label": "Родительские темы" },
            h(
              "span",
              { class: "note-parents-label" },
              parents.length === 1 ? "Родительская тема:" : "Родительские темы:",
            ),
            h(
              "ul",
              null,
              ...parents.map((parent) =>
                h(
                  "li",
                  null,
                  h(
                    "a",
                    { class: "internal", href: parent.slug === "index" ? "/" : `/${parent.slug}` },
                    String(parent.frontmatter?.title ?? parent.slug),
                  ),
                ),
              ),
            ),
          )
        : null,
    )
  }
  Component.css = `.note-metadata{color:var(--gray);font-size:0.85rem;margin:0.15rem 0 1rem}.note-version{margin:0}.note-parents{display:flex;flex-wrap:wrap;gap:0.25rem 0.5rem}.note-parents ul{display:flex;flex-wrap:wrap;gap:0.25rem 0.65rem;list-style:none;margin:0;padding:0}`
  return Component
}
