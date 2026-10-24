import { readFile, readdir, rm } from "node:fs/promises"
import path from "node:path"
import YAML from "yaml"

export const hasExplicitPublishFlag = (markdown: string): boolean => {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) return false
  const metadata = YAML.parse(match[1]) as Record<string, unknown> | null
  return metadata?.draft === false
}

export const filterUnpublishedNotes = async (directory: string): Promise<void> => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "assets" || entry.name === "_flat-tags") {
      continue
    }
    const candidate = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      await filterUnpublishedNotes(candidate)
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      if (!hasExplicitPublishFlag(await readFile(candidate, "utf8"))) await rm(candidate)
    }
  }
}
