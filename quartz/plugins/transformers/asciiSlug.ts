import { QuartzTransformerPlugin } from "../types"

const charMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
}

const transliterateSegment = (input: string) => {
  const lowered = input.normalize("NFC").toLowerCase()
  let output = ""

  for (const ch of lowered) {
    output += charMap[ch] ?? ch
  }

  return output
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
}

const toAsciiSlug = (slug: string) => {
  return slug
    .split("/")
    .map((segment) => transliterateSegment(segment))
    .filter((segment) => segment.length > 0)
    .join("/")
}

export const AsciiSlug: QuartzTransformerPlugin = () => {
  return {
    name: "AsciiSlug",
    markdownPlugins() {
      return [
        () => {
          return (_tree, file) => {
            const rawSlug = String(file.data.slug ?? "")
            if (!rawSlug) return
            const normalized = toAsciiSlug(rawSlug)
            if (normalized) {
              file.data.slug = normalized
            }
          }
        },
      ]
    },
  }
}
