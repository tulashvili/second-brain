const characterMap: Record<string, string> = {
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

export const transliterateSegment = (input: string): string => {
  const lowered = input.normalize("NFC").toLowerCase()
  let output = ""

  for (const character of lowered) {
    output += characterMap[character] ?? character
  }

  return output
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
}

export const toAsciiSlug = (slug: string): string =>
  slug
    .split("/")
    .map((segment) => transliterateSegment(segment))
    .filter((segment) => segment.length > 0)
    .join("/")

export const toFlatAsciiSlug = (slug: string): string => {
  const segments = slug.split("/").filter((segment) => segment.length > 0)
  return transliterateSegment(segments.at(-1) ?? "")
}
