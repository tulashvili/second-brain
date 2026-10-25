import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { h } from "preact"

export const NoteMetadata: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ fileData, allFiles, cfg }: QuartzComponentProps) => {
    const version = fileData.frontmatter?.version
    const hasVersion = typeof version === "string" || typeof version === "number"
    const upLinks = (fileData as typeof fileData & { semanticUpLinks?: string[] }).semanticUpLinks
    const parents = [...new Set(upLinks ?? [])]
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
    if (!hasVersion && parents.length === 0) return null

    const english = cfg.locale === "en-US"
    const prefix = english ? "/en" : ""
    const parentLabel = english
      ? parents.length === 1
        ? "Parent topic:"
        : "Parent topics:"
      : parents.length === 1
        ? "Родительская тема:"
        : "Родительские темы:"

    return h(
      "div",
      { class: "note-metadata" },
      hasVersion
        ? h(
            "p",
            { class: "note-version" },
            `${english ? "Note version" : "Версия заметки"}: ${String(version)}`,
          )
        : null,
      parents.length > 0
        ? h(
            "nav",
            {
              class: "note-parents",
              "aria-label": english ? "Parent topics" : "Родительские темы",
            },
            h("span", { class: "note-parents-label" }, parentLabel),
            h(
              "ul",
              null,
              ...parents.map((parent) =>
                h(
                  "li",
                  null,
                  h(
                    "a",
                    {
                      class: "internal",
                      href: parent.slug === "index" ? `${prefix}/` : `${prefix}/${parent.slug}`,
                    },
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
